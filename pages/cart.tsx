import Default from '@layout/Default/defaultLayout'
import CartPage from '@template/cart/CartPage'
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

    return {
        props: {
            categories: categories.filter((cat: any) => cat.active),
        }
    }
}

const CartPageWrap: FC<any> = ({ categories }) => {
    return (
        <Default>
            <CartPage categories={categories} />
            <Footer categories={categories} />
        </Default>
    )
}

export default CartPageWrap;
