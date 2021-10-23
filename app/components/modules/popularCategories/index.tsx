import React, { FC } from 'react'
import Link from 'next/link';

type pageProps = {
    categories: any;
    config: {
        showTitle: boolean;
        title?: string;
    }
}
const PopularCategories: FC<pageProps> = ({ categories, config }) => {
    return (
        <div className="m-b-60">
            {config.showTitle && <h3 className="primary-heading heading-bottom-border">{config.title ? config.title : 'Popular Categories'}</h3>}
            <div className="M-flex-container m-t-30">
                {categories.map((category: any, index: number) => {
                    return <Link href={category.url} key={index} shallow={true}>
                        <div className="other-cat-card animate__animated animate__zoomIn animate__faster">
                            <div className="service-img">
                                <img className="" src={category.largeImg} />
                            </div>
                            <div className="service-name">{category.name}</div>
                        </div>
                    </Link>
                })}
            </div>
        </div>
    )
}

export default PopularCategories
