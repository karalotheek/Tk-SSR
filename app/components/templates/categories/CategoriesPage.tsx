import React, { FC } from 'react'
import Link from 'next/link';
import SvgIcon from '@element/svgIcon';

const CategoriesPage: FC<any> = ({ categories, services }) => {
    return (
        <div className="categories-page-wrap container clearfix">
            <h3 className="primary-heading heading-bottom-border">Our Services</h3>
            {categories && categories.map((category: any, catIndex: number) => {
                return <Link href={category.url} key={catIndex} shallow={true}>
                    <div className="category animate__animated animate__zoomIn animate__faster">
                        <div className="">
                            <div className="img">
                                <img className="serviceImage" src={category.largeImg} />
                            </div>
                            <h2 className="service-name">{category.name}</h2>
                            <ul className="services-list">
                                {services && services.map((service: any, servIndex: number) => {
                                    return <div className="service" key={servIndex}>
                                        {(service.categoryId == category.key) && <li>{service.name}</li>}
                                    </div>
                                })}
                            </ul>
                            <div className="btn-wrap clearfix d-f-ac">
                                <div className="clearfix action-btn-outer d-f-ac">
                                    <div className="clearfix action-btn-wrap">
                                        <div className="action-btn-icon">
                                            <SvgIcon icon="info" />
                                        </div>
                                        <div className="action-btn-text">Explore</div>
                                    </div>
                                </div>
                            </div>
                        </div >
                    </div >
                </Link>
            })}
        </div >
    )
}

export default CategoriesPage
