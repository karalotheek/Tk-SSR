import React, { FC, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import { Transition } from '@element/slideModalTransition';
import SvgIcon from '@element/svgIcon';
import { useRouter } from 'next/router'

const RemoveItemCartModal: FC<any> = ({ handleClose, activeService }) => {
    const router = useRouter();
    const [open, setOpen] = useState(true);

    const onClose = (status: boolean) => {
        handleClose(status);
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
                        <h3 className="modal-heading">Confirmation !</h3>
                    </div>
                    <div className="modal-body">
                        <div className="inner-content">
                            Are you sure you want to remove <strong>{activeService?.name}</strong> service from Cart ?
                        </div>
                        <div className="modal-footer d-f-ac">
                            <div className="clearfix action-btn-outer d-f-ac m-r10">
                                <div className="clearfix action-btn-wrap" onClick={() => onClose(false)}>
                                    <div className="action-btn-icon">
                                        <SvgIcon icon="cancel" />
                                    </div>
                                    <div className="action-btn-text">No</div>
                                </div>
                            </div>
                            <div className="clearfix action-btn-outer d-f-ac">
                                <div className="clearfix action-btn-wrap" onClick={() => onClose(true)}>
                                    <div className="action-btn-icon">
                                        <SvgIcon icon="removeFromCart" />
                                    </div>
                                    <div className="action-btn-text">Yes Remove</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default RemoveItemCartModal;