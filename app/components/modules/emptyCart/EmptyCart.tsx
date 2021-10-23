import React, { FC } from 'react'
import SvgIcon from '@element/svgIcon';
import Link from 'next/link';

type EmptyCartPageProps = {
    showAddMoreServicesBtn: boolean;
}
const EmptyCart: FC<EmptyCartPageProps> = ({ showAddMoreServicesBtn }) => {
    return (
        <div className="empty-cart-wrap animate__animated animate__zoomIn animate__faster">
            <div className="width100 d-f-ac">
                <img className="width100 empty-cart" src="/assets/img/empty-cart.svg" />
            </div>
            <div className="empty-cart-msg">
                <span>Your cart is empty</span>
            </div>
            {showAddMoreServicesBtn && <div className="add-more-services width100">
                <Link href="categories" shallow={true}>
                    <div className="clearfix action-btn-outer d-f-ac">
                        <div className="clearfix action-btn-wrap">
                            <div className="action-btn-icon">
                                <SvgIcon icon="home" />
                            </div>
                            <div className="action-btn-text">Add more services</div>
                        </div>
                    </div>
                </Link>
            </div>}
        </div>
    )
}

export default EmptyCart
