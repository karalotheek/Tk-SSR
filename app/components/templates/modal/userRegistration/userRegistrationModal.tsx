import React, { FC, useState, useEffect } from 'react';
import Dialog from '@material-ui/core/Dialog';
import { Transition } from '@element/slideModalTransition';
import SvgIcon from '@element/svgIcon';
import { vibrate } from '@services/globalService';
import $ from 'jquery';
import { windowRef } from '@services/window';
import { useDispatch } from 'react-redux';
import { disableLoader, enableLoader, showError, updateLoggedInUserData } from '@context/actions';
import Firebase from "@firebase/client";
import { getUserByPhone, registerUser } from '@services/users';
import Link from 'next/link';

type UserRegistrationPageProps = {
    handleClose: any,
    phone?: number
}

type User = {
    name: string,
    phone: any,
    email?: string
}
const UserRegistrationModal: FC<UserRegistrationPageProps> = ({ handleClose, phone }) => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(true);
    const [getOtpModal, setGetOtpModal] = useState(true);
    const [verifyOtpModal, setVerifyOtpModal] = useState(false)
    const [registrationModal, setRegistrationModal] = useState(false)
    const [loginNumber, setLoginNumber] = useState(phone || '');
    const [error, setError] = useState('');
    const [resendOtpStatus, setResendOtpStatus] = useState(false);
    const [availableUserData, setAvailableUserData] = useState<any>(null);
    const [user, setUser] = useState<User>({ name: '', phone: '', email: '' })
    const [otp, setOtp] = useState<any>('');
    const [resetOtpCounter, setResetOtpCounter] = useState(30);
    const [startResetOtpCounter, setStartResetOtpCounter] = useState(true);

    const onClose = (userata: any) => {
        handleClose(userata);
        setOpen(false);
    }

    useEffect(() => {
        if (startResetOtpCounter && resetOtpCounter > 0) {
            setTimeout(() => setResetOtpCounter(resetOtpCounter - 1), 1000);
        } else {
            setResendOtpStatus(true);
            setStartResetOtpCounter(false);
        }
    }, [startResetOtpCounter, resetOtpCounter]);

    const handleCaptchResponse = () => {
        windowRef.recaptchaVerifier.reset()
        console.log('ressss')
    }
    const initializeCaptcha = () => {
        windowRef.recaptchaVerifier = new Firebase.auth.RecaptchaVerifier('recaptcha-container', {
            size: "invisible", callback: () => handleCaptchResponse()
        })
        windowRef.recaptchaVerifier.render()
    }

    const onPhoneInputEnterPress = (e: any) => {
        if (e.key == 'Enter') getOtp();
    }

    const onOtpInputEnterPress = (e: any) => {
        if (e.key == 'Enter') verifyOTP();
    }

    const onNumberChangeClick = () => {
        setOtp(null);
        setGetOtpModal(true);
        setVerifyOtpModal(false);
    }
    const onPhoneChange = (number: string, from: any = '') => {
        setError('');
        const num: any = number.charAt(number?.length - 1).replace(".", '');
        if ((((num && num != ' ') && !isNaN(num)) || number?.length == 0) && number?.length <= 10) {
            if (from == 'registration') setUser({ ...user, phone: number });
            setLoginNumber(number);
        }
    }

    const onOtpChange = (number: string) => {
        setError('');
        const num: any = number.charAt(number?.length - 1).replace(".", '');
        if ((((num && num != ' ') && !isNaN(num)) || number?.length == 0) && number?.length <= 6) {
            setOtp(number);
        }
    }

    const getOtp = () => {
        if (!loginNumber || loginNumber.toString().length != 10) {
            setError('phone');
            $('.phone-input').addClass('shaker');
            setTimeout(function () {
                $('.phone-input').removeClass('shaker');
            }, 300);
            vibrate();
            return;
        } else {
            setResendOtpStatus(false);
            windowRef.confirmationResult = null;
            dispatch(enableLoader());
            if (!windowRef.recaptchaVerifier) initializeCaptcha();
            const appVerifier = windowRef.recaptchaVerifier;
            const num = '+91' + loginNumber;
            Firebase.auth().signInWithPhoneNumber(num, appVerifier)
                .then(result => {
                    windowRef.confirmationResult = result;
                    getUserByPhone(loginNumber).then((res: any) => {
                        if (res.length) {
                            setAvailableUserData(res[0])
                            setVerifyOtpModal(true);
                        } else {
                            setUser({ ...user, phone: loginNumber })
                            setRegistrationModal(true);
                            setStartResetOtpCounter(true);
                        }
                        setTimeout(() => {
                            dispatch(disableLoader());
                        })
                        setGetOtpModal(false);
                    })
                })
                .catch(error => {
                    dispatch(disableLoader());
                    if (error.message) {
                        dispatch(showError(error.message, 5000))
                    } else {
                        dispatch(showError('OTP sending failed, please try again.'))
                    }
                    console.log("OTP sending failed", error);
                })
        }
    }

    const otpVerification = (otp: any) => {
        return new Promise((res, rej) => {
            if (!otp || otp.toString().length != 6) {
                setError("otp");
                dispatch(disableLoader());
            } else {
                windowRef.confirmationResult
                    .confirm(otp)
                    .then((result: any) => {
                        res(result.user);
                        setResendOtpStatus(false);
                        // windowRef.recaptchaVerifier.reset();
                    })
                    .catch((error: any) => {
                        console.log("Incorrect code entered", error)
                        dispatch(disableLoader())
                        setResendOtpStatus(true);
                        setOtp(null);
                        setError("otp");
                        rej();
                    });
            }
        })
    }
    const resendOTP = (event: any) => {
        dispatch(enableLoader())
        var captchInterval = setInterval(() => {
            if (document.getElementById("recaptcha-container")) {
                clearInterval(captchInterval);
                if (!windowRef.recaptchaVerifier) initializeCaptcha();
                const appVerifier = windowRef.recaptchaVerifier;
                const num = '+91' + loginNumber;
                setOtp(null);
                Firebase.auth().signInWithPhoneNumber(num, appVerifier)
                    .then(result => {
                        // windowRef.recaptchaVerifier.reset();
                        windowRef.confirmationResult = result;
                        setTimeout(() => {
                            setResendOtpStatus(false);
                            dispatch(disableLoader())
                        })
                    })
                    .catch(error => {
                        dispatch(disableLoader());
                        if (error.message) {
                            dispatch(showError(error.message, 5000))
                        } else {
                            dispatch(showError('OTP sending failed, please try again.'))
                        }
                        console.log("OTP sending failed", error);
                    })
            }
        })
        event.preventDefault();
    }
    const verifyOTP = () => {
        dispatch(enableLoader())
        setError('');
        otpVerification(otp).then((promiseRes) => {
            if (availableUserData) {
                dispatch(disableLoader())
                setVerifyOtpModal(false);
                dispatch(updateLoggedInUserData(availableUserData));
                onClose(availableUserData);
                // this.setMessaging()
            } else {
                getUserByPhone(loginNumber).then((res: any) => {
                    if (res.length) {
                        dispatch(disableLoader())
                        setVerifyOtpModal(false);
                        dispatch(updateLoggedInUserData(res[0]));
                        onClose(res[0]);
                        // this.setMessaging()
                    }
                })
            }
        }).catch(() => {

        });
    }
    const registrationFormValid = () => {
        setError('');
        if (!user || !user.name) {
            $('#name').addClass('shaker');
            setError('name');
            setTimeout(function () {
                $('#name').removeClass('shaker');
            }, 300);
            return false;
        } else if (!user.phone || user.phone.length != 10) {
            setError('phone');
            $('#phone').addClass('shaker');
            setTimeout(function () {
                $('#phone').removeClass('shaker');
            }, 300);
            return false;
        } else if (!otp || otp.length != 6) {
            setError('otp');
            $('#otp').addClass('shaker');
            setTimeout(function () {
                $('#otp').removeClass('shaker');
            }, 300);
            return false;
        } else return true;
    }
    const userRegistration = () => {
        if (registrationFormValid()) {
            dispatch(enableLoader())
            otpVerification(otp).then((res) => {
                registerUser(user).subscribe((userId) => {
                    getUserByPhone(loginNumber).then((res: any) => {
                        if (res.length) {
                            setRegistrationModal(false);
                            setVerifyOtpModal(false);
                            dispatch(disableLoader())
                            dispatch(updateLoggedInUserData(res[0]));
                            onClose(res[0]);
                            // this.setMessaging()
                        }
                    })
                })
            }).catch(() => {
                console.log('Otp verification failed');
            });
        }
    }
    return (
        <div className="consulatation-wrap">
            <Dialog
                TransitionComponent={Transition}
                disableEnforceFocus={true}
                onClose={() => onClose(null)}
                open={open}
                disableBackdropClick={true}
                disableEscapeKeyDown={true}
                className="modal-outer"
            >
                {getOtpModal && <div className="modal-content">
                    <div className="modal-close-btn" onClick={() => onClose(null)}>
                        <SvgIcon icon="close" color="#001871" fontSize={20} />
                    </div>
                    <div className="modal-header">
                        <h3 className="modal-heading">Login Or SignUp !</h3>
                    </div>
                    <div className="modal-body">
                        <div className="inner-content">
                            <div className="input-wrap">
                                <input
                                    className={error == 'phone' ? 'phone-input t-ac invalid-input' : 'phone-input t-ac'}
                                    autoComplete="off"
                                    value={loginNumber}
                                    onKeyPress={onPhoneInputEnterPress}
                                    onChange={(e) => onPhoneChange(e.target.value)}
                                    type="number"
                                    placeholder="Mobile Number*"
                                />
                                {error == 'phone' && <div className="error">Enter valid mobile number</div>}
                            </div>
                        </div>
                        <div className="modal-footer d-f-ac">
                            <div className="clearfix action-btn-outer d-f-ac m-r10">
                                <div className="clearfix action-btn-wrap" onClick={getOtp}>
                                    <div className="action-btn-icon">
                                        <SvgIcon icon="incomming" />
                                    </div>
                                    <div className="action-btn-text">Get Otp</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}

                {verifyOtpModal && <div className="modal-content">
                    <div className="modal-close-btn" onClick={() => onClose(null)}>
                        <SvgIcon icon="close" color="#001871" fontSize={20} />
                    </div>
                    <div className="modal-header">
                        <h3 className="modal-heading">Verify with OTP</h3>
                        <h4 className="sub-heading">OTP Sent to {loginNumber}. <div onClick={() => onNumberChangeClick()} className="action">&#9756; Change</div></h4>
                    </div>
                    <div className="modal-body">
                        <div className="inner-content">
                            <div className="input-wrap">
                                <input
                                    className={error == 'otp' ? 'phone-input t-ac invalid-input' : 'phone-input t-ac'}
                                    autoComplete="off"
                                    value={otp}
                                    onKeyPress={onOtpInputEnterPress}
                                    onChange={(e) => onOtpChange(e.target.value)}
                                    type="number"
                                    minLength={6}
                                    maxLength={6}
                                    placeholder="Enter 6 digit OTP"
                                />
                                {error == 'otp' && <div className="error">Enter valid OTP</div>}
                                <div id="recaptcha-container"></div>
                            </div>
                        </div>

                        {resetOtpCounter != 0 && !resendOtpStatus && <div className="footer-note">Resend OTP in ?<span> {resetOtpCounter}</span></div>}
                        {resendOtpStatus && <div className="footer-note">Any Trouble with OTP ?<span onClick={resendOTP}> Resend OTP</span></div>}

                        <div className="modal-footer d-f-ac">
                            <div className="clearfix action-btn-outer d-f-ac m-r10">
                                <div className="clearfix action-btn-wrap" onClick={verifyOTP}>
                                    <div className="action-btn-icon">
                                        <SvgIcon icon="verify" />
                                    </div>
                                    <div className="action-btn-text">Verify</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}

                {registrationModal && <div className="modal-content">
                    <div className="modal-close-btn" onClick={() => onClose(null)}>
                        <SvgIcon icon="close" color="#001871" fontSize={20} />
                    </div>
                    <div className="modal-header">
                        <h3 className="modal-heading">Signup !</h3>
                        <h4 className="sub-heading">OTP Sent to {loginNumber}.</h4>
                    </div>
                    <div className="modal-body">
                        <div className="inner-content">
                            <div className="input-wrap" id="name">
                                <input
                                    className={error == 'name' ? 'phone-input invalid-input' : 'phone-input'}
                                    autoComplete="off"
                                    value={user.name}
                                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                                    type="text"
                                    placeholder="Name*"
                                />
                                {error == 'name' && <div className="error">Enter your name</div>}
                            </div>
                            <div className="input-wrap" id="phone">
                                <input
                                    className={error == 'phone' ? 'phone-input invalid-input' : 'phone-input'}
                                    autoComplete="off"
                                    value={user.phone}
                                    onChange={(e) => onPhoneChange(e.target.value, 'registration')}
                                    type="number"
                                    placeholder="Mobile Number*"
                                />
                                {error == 'phone' && <div className="error">Enter valid mobile number</div>}
                            </div>
                            <div className="input-wrap" id="email">
                                <input
                                    className={error == 'email' ? 'phone-input invalid-input' : 'phone-input'}
                                    autoComplete="off"
                                    value={user.email}
                                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                                    type="email"
                                    placeholder="Email"
                                />
                                {error == 'email' && <div className="error">Enter a valid email address</div>}
                            </div>
                            <div className="input-wrap" id="otp">
                                <input
                                    className={error == 'otp' ? 'phone-input invalid-input' : 'phone-input'}
                                    autoComplete="off"
                                    value={otp}
                                    onChange={(e) => onOtpChange(e.target.value)}
                                    type="number"
                                    minLength={6}
                                    maxLength={6}
                                    placeholder="Enter 6 digit OTP"
                                />
                                {error == 'otp' && <div className="error">Enter valid OTP</div>}
                            </div>
                        </div>

                        {resetOtpCounter != 0 && !resendOtpStatus && <div className="footer-note">Resend OTP in ?<span> {resetOtpCounter}</span></div>}
                        {resendOtpStatus && <div className="footer-note">Any Trouble with OTP ?<span onClick={resendOTP}> Resend OTP</span></div>}

                        <div className="footer-note">
                            By creating an account, you agree to our <Link href="/tnc" shallow={true}>Terms of Service</Link> and have reviewed our <Link href="/tnc" shallow={true}>Privacy Policy</Link>.
                        </div>
                        <div className="modal-footer d-f-ac">
                            <div className="clearfix action-btn-outer d-f-ac m-r10">
                                <div className="clearfix action-btn-wrap" onClick={userRegistration}>
                                    <div className="action-btn-icon">
                                        <SvgIcon icon="addUser" />
                                    </div>
                                    <div className="action-btn-text">Register</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}
                <div className="modal-body recaptcha-wrap">
                    <div className="inner-content">
                        <div className="input-wrap">
                            <div id="recaptcha-container"></div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default UserRegistrationModal;