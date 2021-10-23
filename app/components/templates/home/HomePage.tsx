import React, { FC } from 'react'
import Link from 'next/link';
import Img from '@element/image';
import PopularCategories from '@module/popularCategories';

const HomePage: FC<any> = ({ categories, curations }) => {
  return (
    <div>

      <div className="container">
        <PopularCategories categories={categories} config={{ showTitle: false }} />
        {/* 
        <div className="M-flex-container m-t-25">
          {categories ? categories.map((category: any, index: number) => {
            return <Link key={index} href={category.url} shallow={true}>
              <div className="home-card M-postion-relative animate__animated animate__zoomIn animate__faster">
                <div className="large-service-img">
                  <img className="" src={category.largeImg} />
                </div>
                <div className="large-service-name">{category.name}</div>
              </div>
            </Link>
          }) : null}
        </div> */}
      </div>

      <div className="curated-group-wrap">
        {curations ? curations.map((group: any, gindex: number) => {
          return <div key={gindex} className="width100">
            <h2 className="primary-heading group-name m-z">{group.name}</h2>
            <h3 className="para-text">{group.description}</h3>
            <div className=" d-f-ac curated-items-wrap">
              {group.curatedItems ? group.curatedItems.map((item: any, index: number) => {
                return <Link key={index} href={item.url} shallow={true}>
                  <div className="curated-item">
                    <div className="curated-item-img-wrap">
                      <img src={item.smallImg} />
                    </div>
                    <div className="curated-item-name">{item.name}</div>
                  </div>
                </Link>
              }) : null}
            </div>
          </div>
        }) : null}
      </div>

      <div className="container">
        <div className="fullwidth">
          <h2 className="primary-heading m-z ">How It Works</h2>
          <div style={{ marginTop: '0' }} className="M-flex-container-C-wrap m-t-120">
            <div className="flex-1">
              <img className="width-65" src="/assets/img/booking.svg" />
            </div>
            <div className="flex-1">
              <h3 className="secondary-heading">Service Booking</h3>
              <p className="para-text">Select from our wide range of services on website, review prices, set location,
                    date, time and payment mode as per your convenience.</p>
            </div>
          </div>
          <div className="M-flex-container-C-wrap m-t-120">
            <div className="flex-1">
              <h3 className="secondary-heading">Service Delivery</h3>
              <p className="para-text">Our service experts will contact you for any additional information and will be
                    there at the scheduled time. Sit and relax while our expert delivers the service.</p>
            </div>
            <div className="flex-1 M-align-centre">
              <img className="width-65" src="/assets/img/serviceman.svg" />
            </div>
          </div>
          <div className="M-flex-container-C-wrap m-t-120">
            <div className="flex-1 feedback-img">
              <img className="width-65" src="/assets/img/confirmed.svg" />
            </div>
            <div className="flex-1">
              <h3 className="secondary-heading">Complete Payment And Leave Feedback</h3>
              <p className="para-text">On completion of service, pay via the selected payment mode, and a receipt will be
                    generated. We would highly appreciate if you can leave your feedback.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default HomePage
