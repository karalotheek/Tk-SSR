import React, { useEffect, useState, SyntheticEvent, MouseEvent } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Alert from '@material-ui/lab/Alert';
import { useSelector } from 'react-redux';
import Slide, { SlideProps } from '@material-ui/core/Slide';
import { clearAlert } from '@context/actions';
import { useDispatch } from 'react-redux';
type TransitionProps = Omit<SlideProps, 'direction'>;

function TransitionRightToLeft(props: TransitionProps) {
    return <Slide {...props} direction="down" />;
}
function AlertNotification() {

    const dispatch = useDispatch();
    const alert = useSelector((state: any) => state.alert);
    const [displayAlert, setDisplayAlert] = useState(false);
    const handleClose = (event: SyntheticEvent | MouseEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setDisplayAlert(false);
    };

    useEffect(() => {
        if (alert.type && !displayAlert) {
            setDisplayAlert(true);
            setTimeout(() => {
                setDisplayAlert(false);
                dispatch(clearAlert());
            }, alert.time)
        }
    }, [alert])

    return (
        <>
            {displayAlert ? <div className="alert-wrap">
                <Snackbar open={displayAlert}
                    className={alert.type}
                    autoHideDuration={alert.duration}
                    TransitionComponent={TransitionRightToLeft}
                    // message={alert.message}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    key='topright'
                >
                    <Alert
                        onClose={handleClose}
                        severity={alert.type}
                        action={
                            <IconButton
                                aria-label="close"
                                color="inherit"
                                size="small"
                                onClick={() => {
                                    setDisplayAlert(false);
                                }}
                            >
                                <CloseIcon fontSize="inherit" />
                            </IconButton>
                        }
                    >{alert.message}</Alert>
                </Snackbar>
            </div> : null}
        </>
    )
}

export default AlertNotification;
