import Default from '@layout/Default/defaultLayout'
import CheckoutPage from '@template/checkout/CheckoutPage';
import React, { FC } from 'react'
import db from '@firebase/admin';
import Footer from '@module/footer/footer';

const CheckoutPageWrap: FC<any> = ({ categories, curations }) => {
    return (
        <Default>
            <CheckoutPage categories={categories} curations={curations} />
            <Footer categories={categories} />
        </Default>
    )
}

export const getStaticProps = async () => {
    const categoriesData = await db.collection('categories').orderBy('index').get();
    const categories = categoriesData.docs.map((doc) => {
        let data = doc.data();
        let category: any = {
            key: doc.id,
            ...data,
        }
        return category;
    });

    const curationsData = await db.collection('curations').get();
    const curations = curationsData.docs.map((doc) => {
        let data = doc.data();
        let groupdata: any = {
            key: doc.id,
            ...data,
            toDate: '',
            fromDate: '',
            fromTime: '',
            toTime: '',
        }
        return groupdata;
    });
    return {
        props: {
            categories: categories.filter((cat: any) => cat.active),
            curations: curations.filter((cat: any) => cat.active),
        }
    }
}

export default CheckoutPageWrap;