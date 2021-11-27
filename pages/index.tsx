import React, { FC } from "react";
import Default from '@layout/Default/defaultLayout';
import Home from "@template/home/HomePage";
import db from '@firebase/admin';
import { timeStampToNewDate } from "@services/util";
import Footer from "@module/footer/footer";


export const getStaticProps = async () => {
  const categoriesData = await db.collection('categories').orderBy('index').get();
  const categories = categoriesData.docs.map((doc) => {
    let data = doc.data();
    let category: any = {
      key: doc.id,
      ...data,
      url: ''
    }
    if (category.sUrl) {
      let url = category.sUrl.toLowerCase();
      url = url.split(" ").join("-");
      category.url = url.split("  ").join("-");
    }
    return category;
  });

  const servicesData = await db.collection('services').get();
  const services = servicesData.docs.map((doc) => {
    let data = doc.data();
    let service: any = {
      key: doc.id,
      ...data,
    }
    if (service.sUrl) {
      let url = service.sUrl.toLowerCase();
      url = url.split("  ").join("-");
      service.url = url.split(" ").join("-");
    }
    return service;
  });

  const curationsData = await db.collection('curations').get();
  const curations = curationsData.docs.map((doc) => {
    let data = doc.data();
    let groupdata: any = {
      key: doc.id,
      ...data,
      fromDate: timeStampToNewDate(data.fromDate) || '',
      toDate: timeStampToNewDate(data.toDate) || '',
      fromTime: timeStampToNewDate(data.fromTime) || '',
      toTime: timeStampToNewDate(data.toTime) || '',
      url: ''
    }

    groupdata.curatedItems.map((curationData: any) => {
      let category = categories.filter((data) => data.key == curationData.categoryId);
      let categoryUrl = category[0].sUrl ? category[0].sUrl.toLowerCase() : '';
      categoryUrl = categoryUrl.split("  ").join("-");
      categoryUrl = categoryUrl.split(" ").join("-");
      if (groupdata.type == 'Category') curationData.url = categoryUrl;
      else {
        let service = services.filter((data) => data.key == curationData.serviceId);
        if (service[0] && service[0].sUrl && categoryUrl) {
          let url = service[0].sUrl.toLowerCase();
          url = url.split(" ").join("-");
          url = url.split("  ").join("-");
          url = categoryUrl + '/' + url;
          curationData.url = url;
        } else curationData.url = categoryUrl;
      }
    })
    return groupdata;
  });
  return {
    props: {
      categories: categories.filter((cat: any) => cat.active),
      curations: curations.filter((cat: any) => cat.active),
    },
    revalidate: 10
  }
}

const HomeWrapper: FC<any> = ({ categories, curations }) => {
  return (
    <div className="home-page-wrapper">
      <Default>
        <Home categories={categories} curations={curations} />
        <Footer categories={categories} />
      </Default>
    </div>
  );
}

export default HomeWrapper;