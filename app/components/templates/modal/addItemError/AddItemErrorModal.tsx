import React, { FC, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import { Transition } from '@element/slideModalTransition';
import SvgIcon from '@element/svgIcon';
import { useRouter } from 'next/router'

const AddItemErrorModal: FC<any> = ({ handleClose, activeService }) => {
    const router = useRouter();
    const [open, setOpen] = useState(true);

    const onClose = () => {
        handleClose();
        setOpen(false);
    }

    return (
        <div className="consulatation-wrap">
            <Dialog
                TransitionComponent={Transition}
                disableEnforceFocus={true}
                onClose={onClose}
                open={open}
                disableBackdropClick={true}
                disableEscapeKeyDown={true}
                className="modal-outer"
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h3 className="modal-heading">Ooops... !</h3>
                    </div>
                    <div className="modal-body">
                        <div className="inner-content">
                            Your cart contain 3 services, cannot add more than 3 services in cart.
                        </div>
                        <div className="modal-footer d-f-ac">
                            <div className="clearfix action-btn-outer d-f-ac m-r10">
                                <div className="clearfix action-btn-wrap" onClick={onClose}>
                                    <div className="action-btn-icon">
                                        <SvgIcon icon="cancel" />
                                    </div>
                                    <div className="action-btn-text">Cancel</div>
                                </div>
                            </div>
                            <div className="clearfix action-btn-outer d-f-ac">
                                <div className="clearfix action-btn-wrap" onClick={() => { router.push('/cart'); onClose(); }}>
                                    <div className="action-btn-icon">
                                        <SvgIcon icon="cart" />
                                    </div>
                                    <div className="action-btn-text">Go To Cart</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default AddItemErrorModal;