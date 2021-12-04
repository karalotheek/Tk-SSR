import React, { FC } from 'react'
import db from '@firebase/admin';
import router from 'next/router';
import { redirect } from 'next/dist/next-server/server/api-utils';
import { isMobile } from 'react-device-detect';

const Footer: FC<any> = ({ categories }) => {

    const redirect = (status: any) => {
        if (status == 'fb') {
            window.open('https://www.facebook.com/Theek-karalo-103036601535975/', "_blank")
        } else {
            window.open('https://instagram.com/theek_karalo?igshid=rzzo4a01mav0', "_blank")
        }
    }
    return (
        <div className="footer-wrap">
            {!isMobile && <footer className="">
                <div className="container M-postion-relative">
                    <div className="footer-enquiry" onClick={() => router.push('/')}>
                        Get in touch with us
                    </div>
                    <div className="M-flex-container p-t-120">
                        <div className="f-contactus">
                            <div className="footer-subhead">Contact</div>
                            <div className="address">
                                <div className="f-service-name">My Home Builders Tower, Ward 97, NH-72, Harrawala, Dehradun, Uttarakhand
                                    248001
                                </div>
                            </div>
                        </div>
                        <div className="services">
                            <div className="footer-subhead">Services</div>
                            <div className="service-list clearfix">
                                {categories.map((category: any, index: number) => {
                                    return <div className="service" key={index}>
                                        <div className="f-service-name" onClick={() => redirect(category)}>{category.name}</div>
                                    </div>
                                })}
                            </div>
                        </div>

                        <div className="company">
                            <div className="footer-subhead">Company</div>
                            <div className="f-service-name" onClick={() => router.push('/')}> About Us </div>
                            <div className="f-service-name" onClick={() => router.push('/')}>Contact Us </div>
                            <div className="f-service-name" onClick={() => router.push('/')} > FAQ</div>
                            <div className="f-service-name" onClick={() => router.push('/')}>Terms & Conditions</div>
                            <div className="f-service-name" onClick={() => router.push('/')}> Privacy & Policy</div>
                            <div className="f-service-name" onClick={() => router.push('/')}> Join As A Professional</div>
                        </div>
                        <div className="contact-link clearfix width100">
                            <div style={{
                                display: 'inline-block',
                                marginTop: '15px'
                            }}>
                                <a className="f-service-name phone" href="tel:+918859507070">+91 8859507070</a>
                                <a className="f-service-name phone" href="tel:+918859030300">+91 8859030300</a>
                                <a className="f-service-name email" href="mailto:karalotheek@gmail.com">karalotheek@gmail.com</a>
                            </div>
                            <div className="social-link">
                                <img className="social-icon" src="/assets/img/facebook-1.png" onClick={() => redirect('fb')} />
                                <img className="social-icon" src="/assets/img/instagram-1.png" onClick={() => redirect('insta')} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="copyright">
                    © 2020 Theek Karalo All Rights Reserved.
                </div>
            </footer>}

            {isMobile && <footer className="mobile">
                <div className="container M-postion-relative">
                    <div className="footer-enquiry" onClick={() => router.push('/')}>
                        Get in touch with us
                    </div>
                    <div className="M-flex-container p-t-120">
                        <div className="services">
                            <div className="footer-subhead">Services</div>
                            <div className="social-link-wrap">
                                {categories.map((category: any, index: number) => {
                                    return <div className="service-flex-container" key={index}>
                                        <div className="f-service-name" onClick={() => redirect(category)}>{category.name}</div>
                                    </div>
                                })}
                            </div>
                        </div>

                        <div className="company">
                            <div className="footer-subhead">Company</div>
                            <div className="f-service-name" onClick={() => router.push('/')}> About Us </div>
                            <div className="f-service-name" onClick={() => router.push('/')}>Contact Us </div>
                            <div className="f-service-name" onClick={() => router.push('/')}> FAQ</div>
                            <div className="f-service-name" onClick={() => router.push('/')}>Terms & Conditions </div>
                            <div className="f-service-name" onClick={() => router.push('/')}> Privacy & Policy</div>
                            <div className="f-service-name" onClick={() => router.push('/')}> Join As A Professional</div>
                        </div>

                        <div className="f-contactus">
                            <div className="footer-subhead">Contact</div>
                            <div className="address">
                                <div className="f-service-name">My Home Builders Tower, Ward 97, NH-72, Harrawala, Dehradun, Uttarakhand
                                    248001
                                </div> <br />
                                <div className="clearfix">
                                    <a className="f-service-name phone" style={{ float: 'left' }} href="tel:+918859030300">+91 8859030300</a>
                                    <a className="f-service-name phone" style={{ float: 'right' }} href="tel:+918859507070">+91 8859507070</a>
                                </div>
                                <a className="f-service-name phone" href="mailto:karalotheek@gmail.com">karalotheek@gmail.com</a>
                            </div>
                        </div>
                        <div className="social-link">
                            <img className="social-icon" src="/assets/img/facebook-1.png" onClick={() => redirect('fb')} />
                            <img className="social-icon" src="/assets/img/instagram-1.png" onClick={() => redirect('insta')} />
                        </div>
                        <div className="copyright">
                            © 2020 Theek Karalo All Rights Reserved.
                        </div>
                    </div>
                </div>
            </footer>}
        </div>
    )
}
export default Footer
