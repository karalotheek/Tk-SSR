import React, { FC, useEffect, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import { Transition } from '@element/slideModalTransition';
import SvgIcon from '@element/svgIcon';
import $ from 'jquery';
import { submitQuotation } from '@services/common';
import { useDispatch } from 'react-redux';
import { disableLoader, enableLoader, showError, showSuccess } from '@context/actions';
import { vibrate } from '@services/globalService';
import { DetectNetworkConnection } from '@util/DetectNetworkConnection';

const ConsultationModal: FC<any> = ({ handleClose, activeService }) => {
    const dispatch = useDispatch();
    const [error, setError] = useState('');
    const [open, setOpen] = useState(true);
    const [consultationData, setConsultationData] = useState({
        phone: '',
        name: '',
        email: '',
        message: '',
    })

    const onClose = () => {
        handleClose();
        setOpen(false);
    }

    const wrongEmail = () => {
        if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(consultationData.email)) return false;
        else return true;
    }

    const handleSubmit = () => {
        if (!consultationData || !consultationData.phone || consultationData.phone?.length != 10) {
            setError('phone');
            $('.phone-input').addClass('shaker');
            setTimeout(function () {
                $('.phone-input').removeClass('shaker');
            }, 300);
            vibrate();
            return;
        } else if (!consultationData.name) {
            setError('name');
            $('.name-input').addClass('shaker');
            setTimeout(function () {
                $('.name-input').removeClass('shaker');
            }, 300);
            vibrate();
            return;
        } else if (!consultationData.message) {
            setError('message');
            $('.message-input').addClass('shaker');
            setTimeout(function () {
                $('.message-input').removeClass('shaker');
            }, 300);
            vibrate();
            return;
        } else {
            if (consultationData.email && wrongEmail()) {
                setError('email');
                $('.email-input').addClass('shaker');
                setTimeout(function () {
                    $('.email-input').removeClass('shaker');
                }, 300);
                vibrate();
                return;
            }
            setError('');
            let data = {
                name: consultationData.name,
                phone: consultationData.phone,
                email: consultationData.email,
                message: consultationData.message,
                serviceId: activeService.key,
                categoryId: activeService.categoryId
            }
            if (DetectNetworkConnection()) {
                dispatch(enableLoader());
                submitQuotation(data).subscribe(() => {
                    dispatch(disableLoader());
                    dispatch(showSuccess('Your details have been sent to our team and they will get back to you shortly.', 7000));
                    vibrate();
                    onClose();
                })
            } else {
                dispatch(showError('You are offline'));
            }
            console.log(consultationData)
        }
    }
    const onPhoneChange = (phone: any) => {
        setError('');
        const num = phone.charAt(phone?.length - 1).replace(".", '');
        if (((num && num != ' ' && phone.length <= 10) && !isNaN(num)) || phone?.length == 0) {
            setConsultationData({ ...consultationData, phone: phone })
        }
    }

    return (
        <div className="consulatation-wrap">
            <Dialog TransitionComponent={Transition} disableEnforceFocus={true} onClose={onClose} open={open} disableBackdropClick={true} disableEscapeKeyDown={true} className="modal-outer">
                <div className="modal-content">
                    <div className="modal-close-btn" onClick={() => onClose()}>
                        <SvgIcon icon="close" color="#001871" fontSize={20} />
                    </div>
                    <div className="modal-header">
                        <h3 className="modal-heading">Get A Quote !</h3>
                        <h4 className="sub-heading">Get a free consultation for {activeService.name}.</h4>
                    </div>
                    <div className="modal-body">
                        <div className="input-wrap">
                            <input
                                className={error == 'phone' ? 'phone-input invalid-input' : 'phone-input'}
                                autoComplete="off"
                                value={consultationData.phone}
                                onChange={(e) => onPhoneChange(e.target.value)}
                                type="number"
                                placeholder="Mobile Number*"
                            />
                            {error == 'phone' && <div className="error">Enter valid mobile number</div>}
                        </div>
                        <div className="input-wrap">
                            <input
                                className={error == 'name' ? 'name-input invalid-input' : 'name-input'}
                                autoComplete="off"
                                value={consultationData.name}
                                onChange={(e) => setConsultationData({ ...consultationData, name: e.target.value })}
                                placeholder="Name*"
                            />
                            {error == 'name' && <div className="error">Please enter name</div>}
                        </div>
                        <div className="input-wrap">
                            <input
                                className={error == 'email' ? 'email-input invalid-input' : 'email-input'}
                                autoComplete="off"
                                type="email"
                                value={consultationData.email}
                                onChange={(e) => setConsultationData({ ...consultationData, email: e.target.value })}
                                placeholder="Email"
                            />
                            {error == 'email' && <div className="error">Please enter valid email</div>}
                        </div>
                        <div className="input-wrap">
                            <textarea className={error == 'message' ? 'message-input invalid-input' : 'message-input'} autoComplete="off" value={consultationData.message} onChange={(e) => setConsultationData({ ...consultationData, message: e.target.value })} placeholder="message*" />
                            {error == 'message' && <div className="error">Please enter message</div>}
                        </div>
                        <div className="modal-footer">
                            <div className="clearfix action-btn-outer d-f-ac" style={{ padding: '0' }}>
                                <div className="clearfix action-btn-wrap" onClick={handleSubmit}>
                                    <div className="action-btn-icon">
                                        <SvgIcon icon="send" alt="" />
                                    </div>
                                    <div className="action-btn-text">Submit</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default ConsultationModal;