import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router'
import firebase from 'firebase';
import { windowRef } from '@services/window';
import { getUserByPhone, registerUser } from '@services/users';
import { LOGO_URL } from '@constant/defaultValues'
const Header = () => {
  const router = useRouter();

  const [otp, setOtp] = useState(null);
  const [otpVerificationComplete, setOtpVerificationComplete] = useState(false);
  const [otpVerificationSuccess, setOtpVerificationSuccess] = useState(false)
  const [isLoading, setisLoading] = useState(false);
  const [loginNumber, setLoginNumber] = useState('');
  const [resendOtpStatus, setResendOtpStatus] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [availableUserData, setAvailableUserData] = useState(null)
  const [user, setUser] = useState({ name: '', phone: '', otp: '' })
  //modals constants
  const [getOtpModal, setGetOtpModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [verifyOtpModal, setVerifyOtpModal] = useState(false);
  const [registrationModal, setRegistrationModal] = useState(false)

  const initializeCaptcha = () => {
    windowRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', { size: "invisible" })
    windowRef.recaptchaVerifier.render()
  }

  const setMessaging = () => {
    // messagingService.requestPermission()
    // messagingService.receiveMessage()
    // message = messagingService.currentMessage
  }

  const loginOrSignup = () => {
    setOtp(null);
    setOtpVerificationComplete(false);
    setOtpVerificationSuccess(false);
    setGetOtpModal(true);
  }
  const resendOTP = (event: any) => {
    setisLoading(true);
    var captchInterval = setInterval(() => {
      if (document.getElementById("recaptcha-container")) {
        clearInterval(captchInterval);
        if (!windowRef.recaptchaVerifier) initializeCaptcha();
        const appVerifier = windowRef.recaptchaVerifier;
        const num = '+91' + loginNumber;
        setOtp(null);
        firebase.auth().signInWithPhoneNumber(num, appVerifier)
          .then(result => {
            windowRef.confirmationResult = result;
            setTimeout(() => {
              setResendOtpStatus(false);
              setisLoading(false);
            })
          })
          .catch(error => {
            setisLoading(false);
            console.log("OTP sending failed", error);
          })
      }
    })
    event.preventDefault();
  }
  const getOTP = () => {
    setResendOtpStatus(false);
    windowRef.confirmationResult = null;
    setLoginError('');
    if (!loginNumber || loginNumber.length < 10) {
      setLoginError("Enter valid phone number");
    } else {
      setisLoading(true);
      var captchInterval = setInterval(() => {
        if (document.getElementById("recaptcha-container")) {
          clearInterval(captchInterval);
          if (!windowRef.recaptchaVerifier) initializeCaptcha();
          const appVerifier = windowRef.recaptchaVerifier;
          const num = '+91' + loginNumber;
          firebase.auth().signInWithPhoneNumber(num, appVerifier)
            .then(result => {
              setTimeout(() => {
                setisLoading(false);
              })
              windowRef.confirmationResult = result;
              getUserByPhone(loginNumber).then((res: any) => {
                if (!otpVerificationComplete) {
                  if (res.length) {
                    //this result used for after otp verified successfully @line 292
                    setAvailableUserData(res[0]);
                    setOtpVerificationComplete(false);
                    setVerifyOtpModal(true);
                  } else {
                    setUser({ ...user, phone: loginNumber });
                    setRegistrationModal(true);
                  }
                  setisLoading(false);
                  setGetOtpModal(false);
                }
              })
            })
            .catch(error => {
              setGetOtpModal(false);
              setisLoading(false);
              console.log(error)
            });
        }
      })
    }
  }
  const otpVerification = (otp: any) => {
    return new Promise((res, rej) => {
      setOtpVerificationSuccess(false);
      if (!otp || otp.length < 6) {
        setLoginError('Enter valid OTP');
        setisLoading(false);
      } else {
        windowRef.confirmationResult
          .confirm(otp)
          .then((result: any) => {
            res(result.user);
            setOtpVerificationComplete(true);
            setOtpVerificationSuccess(true);
            setResendOtpStatus(false);
            windowRef.recaptchaVerifier.reset();
          })
          .catch((error: any) => {
            console.log("Incorrect code entered", error)
            setOtpVerificationSuccess(false);
            setOtpVerificationComplete(false);
            setisLoading(false);
            setResendOtpStatus(true);
            setOtp(null);
            setLoginError("Enter valid OTP")
            rej();
          });
      }
    })
  }
  const verifyOTP = () => {
    setisLoading(true);
    setLoginError('');
    otpVerification(otp).then((promiseRes) => {
      // this.availableUserData is fetched data at the time of get otp process @line 238
      if (availableUserData) {
        if (otpVerificationComplete) {
          setisLoading(false);
          setVerifyOtpModal(false);
          // this.globalService.setLoggedInUserData(this.availableUserData);
          // this.setMessaging()
          setActiveNav('home');
        }
      } else {
        getUserByPhone(loginNumber).then((res: any) => {
          if (res.length && otpVerificationComplete) {
            setisLoading(false);
            setVerifyOtpModal(false);
            // this.globalService.setLoggedInUserData(res[0]);
            // this.setMessaging()
            setActiveNav('home');
          }
        })
      }
    }).catch(() => {

    });
  }
  const registrationFormValid = () => {
    // if (!user.name) {
    //   $('#username').addClass('shaker');
    //   setTimeout(function () {
    //     $('#username').removeClass('shaker');
    //   }, 300);
    //   return false;
    // } else if (!this.user.phone || this.user.phone.length != 10) {
    //   $('#userphone').addClass('shaker');
    //   setTimeout(function () {
    //     $('#userphone').removeClass('shaker');
    //   }, 300);
    //   return false;
    // } else if (!this.user.otp || this.user.otp.length != 6) {
    //   $('#userotp').addClass('shaker');
    //   setTimeout(function () {
    //     $('#userotp').removeClass('shaker');
    //   }, 300);
    //   return false;
    // } else
    return true;
  }
  const registerNewUser = () => {
    if (registrationFormValid()) {
      setisLoading(true);
      otpVerification(user.otp).then((res) => {
        let newUser: any = { ...user };
        delete newUser.otp;
        registerUser(user).subscribe((userId) => {
          getUserByPhone(loginNumber).then((res: any) => {
            if (res.length) {
              setRegistrationModal(false);
              setisLoading(false);
              // this.globalService.setLoggedInUserData(res[0]);
              // this.setMessaging()
              setActiveNav('home');
              setVerifyOtpModal(false);
            }
          })
        })
      }).catch(() => {

      });
    }
  }
  const viewNotification = (notification: any) => {
    setisLoading(true);
    // this.bookingService.getBookingByInvoiceId(notification.invoiceId).subscribe((data) => {
    //   this.webstorageService.setValueInLocalStorage('activeBooking', data[0]);
    //   notification.callingRoute = window.location.pathname.split('/')[1];
    //   this.webstorageService.setValueInLocalStorage('activeNotification', notification);
    //   setisLoading(false);
    //   this.globalService.setActiveNav('bookingdetails');
    // })
  }
  const logout = () => {
    // this.globalService.removeLoggedInUserData();
    // if (window.location.href.includes('myaccount')) this.globalService.setActiveNav('home');
  }

  const setActiveNav = (nav: any) => {
    toggleClass(null, true);
    switch (nav) {
      case 'logout':
        setLogoutModal(true);
        break;
      case 'login':
        loginOrSignup();
        break;
      default:
        router.push('/');
    }
    // if (nav == 'currentbookingstatus') this.globalService.activeRout = 'currentbookingstatus';
  };



  const toggleClass = (e: any, status: any) => {
    let stringClass = 'nav-active';
    let element: any = document.querySelector('header')
    if (element.classList.contains(stringClass) || status) {
      element.classList.remove(stringClass);
      element = document.querySelector('.notification-wrap');
      element.style.opacity = '1';
    } else {
      element.classList.add(stringClass);
      element = document.querySelector('.notification-wrap');
      element.style.opacity = '0';
    }
    element = document.querySelector('.nav')
    if (element.classList.contains(stringClass) || status) element.classList.remove(stringClass); else element.classList.add(stringClass);
  };

  return (
    <div className="header-wrapper">
      <header className="c-header clearfix">
        <div className="header-wrapper">
          <div className="nav-group nav-but-wrap">
            <div className="nav-group menu-icon hover-target" onClick={(e) => toggleClass(e, '')}>
              <span className="nav-group menu-icon-line menu-icon-line-left"></span>
              <span className="nav-group menu-icon-line"></span>
              <span className="nav-group menu-icon-line menu-icon-line-right"></span>
            </div>
          </div>
        </div>
      </header>
      <div className="logo" >
        <img src={LOGO_URL} />
      </div>
      {/* <a className="movable-logo animate__animated animate__zoomIn animate__faster" onClick={() => router.push('/')}><img src="/assets/img/logo_new.png" alt="Logo" /></a> */}
      <div className="nav mobileNav">
        <div className={true ? 'before is-logged-in' : 'before'}></div>
        <div className="nav-content">
          <ul className="nav-list clearfix">
            <li className="nav-list-item activenav" onClick={() => setActiveNav('home')}>
              <a>Home</a>
            </li>
            <li className={true ? 'nav-list-item' : 'nav-list-item'} onClick={() => setActiveNav('categories')} ><a>Categories</a></li>
            <li className={true ? 'nav-list-item' : 'nav-list-item'}><a>Current Status</a></li>
            <li className={true ? 'nav-list-item' : 'nav-list-item'} ><a>Profile</a></li>
            <li className={true ? 'nav-list-item' : 'nav-list-item'}><a>Cart</a></li>
            <li className={true ? 'nav-list-item' : 'nav-list-item'}><a>About Us</a></li>
            <li className={true ? 'nav-list-item' : 'nav-list-item'}><a>Contact Us</a></li>
            <li className={true ? 'nav-list-item' : 'nav-list-item'}><a>FAQ</a></li>
            <li className={true ? 'nav-list-item' : 'nav-list-item'}><a>Login</a></li>
            <li className={true ? 'nav-list-item' : 'nav-list-item'}><a>Logout</a></li>
          </ul>
        </div>
      </div>
      <div className="nav dekstopNav">
        <div className="nav-content">
          <ul className="nav-list clearfix">
            <li className="nav-list-item"><a className="btn">Home</a>
            </li>
            <li className="nav-list-item">
              <a className="btn">Categories</a>
            </li>
            <li className="nav-list-item"><a>About Us</a>
            </li>
            <li className="nav-list-item">
              <a className="btn">Contact Us</a>
            </li>
            <li className="nav-list-item">
              <a className="btn">Login</a>
            </li>
            <li className="nav-list-item">
              <a className="btn">Profile</a>
            </li>
            <li className="nav-list-item">
              <a className="btn">Cart</a>
              <div className="cart-count">00</div>
            </li>
            <li className="nav-list-item">
              <div className="notification-wrap notification">
                <div className="notification-count">00</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
export default Header;