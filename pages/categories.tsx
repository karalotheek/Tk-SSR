import Default from '@layout/Default/defaultLayout'
import CategoriesPage from '@template/categories/CategoriesPage'
import React, { FC } from 'react'
import db from '@firebase/admin';
import Footer from '@module/footer/footer';

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
        let category = categories.filter((data) => data.key == service.categoryId);
        if (category.length == 0) {
            service.url = '';
            service.catUrl = '';
        } else {
            let categoryUrl = category[0].url;
            service.catUrl = categoryUrl;
            if (service && service.sUrl && categoryUrl) {
                let serviceUrl = service.sUrl.toLowerCase();
                serviceUrl = serviceUrl.split(" ").join("-");
                serviceUrl = serviceUrl.split("  ").join("-");
                serviceUrl = categoryUrl + '/' + serviceUrl;
                service.url = serviceUrl;
            } else service.url = categoryUrl;
        }
        return service;
    });

    return {
        props: {
            categories: categories.filter((cat: any) => cat.active),
            services: services.filter((service: any) => service.active),
        }
    }
}

const Categories: FC<any> = ({ categories, services }) => {
    return (
        <Default>
            <CategoriesPage categories={categories} services={services} />
            <Footer categories={categories} />
        </Default>
    )
}

export default Categories
