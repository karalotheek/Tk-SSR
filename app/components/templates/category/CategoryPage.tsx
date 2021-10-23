import React, { FC, useEffect, useState } from 'react'
import Link from 'next/link';
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux';
import PopularCategories from '@module/popularCategories';

const CategoryPage: FC<any> = ({ categories, services, category }) => {
    const router = useRouter();
    const state = useSelector(state => state);

    if (router.isFallback) {
        return (
            <div>loading</div>
        )
    } else {
        if (category) {
            return (
                <div className="category-page-wrapper">
                    <div className="container">
                        <div className="active-service-name">
                            <h2 className="primary-heading">{category.name} Services</h2>
                        </div>
                        <div className="top-container desktop">
                            <div className="">
                                <p className="para-text">{category.description}</p>
                            </div>
                            <div className=" m-t-30">
                                <div className="home-card-wrap">
                                    {services ? services.map((service: any, index: number) => {
                                        return <Link key={index} href={service.url} shallow={true}>
                                            <div className="home-card animate__animated animate__zoomIn animate__faster">
                                                <div className="service-name">{service.name}</div>
                                                <p className="desc-dot">{service.description}</p>
                                            </div>
                                        </Link>
                                    }) : null}
                                </div>
                            </div>
                        </div>
                        <div className="top-container M-flex-container mobile">
                            <div className="">
                                <p className="para-text">{category.description}</p>
                            </div>
                            <div className="M-flex-container m-t-30">
                                <div className="home-card-wrap">
                                    {services ? services.map((service: any, index: number) => {
                                        return <Link key={index} href={service.url} shallow={true}>
                                            <div className="home-card animate__animated animate__zoomIn animate__faster">
                                                <div className="service-name" style={{ padding: '20px', fontSize: '17px', margin: '0' }}>{service.name}</div>
                                            </div>
                                        </Link>
                                    }) : null}
                                </div>
                            </div>
                        </div>
                        <PopularCategories categories={categories} config={{ showTitle: true }} />
                    </div>
                </div >
            )
        } else {
            return <div>Not Found</div>
        }
    }
}

export default CategoryPage
