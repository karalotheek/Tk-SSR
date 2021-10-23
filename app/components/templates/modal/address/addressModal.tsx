import React, { FC, useEffect, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import { Transition } from '@element/slideModalTransition';
import SvgIcon from '@element/svgIcon';
import { useRouter } from 'next/router'
import GoogleMapLocationPicker from '@module/googleMapLocationPicker/index';
import { DEFAULT_CENTER_LATITUDE, DEFAULT_CENTER_LONGITUDE, PRIMARY_COLOUR } from '@constant/defaultValues';
import GoogleAutocomplete from '@module/googleAutocomplete';
import { AddressType } from '@type/common';
import { setAddressObj } from '@services/util';
import { addAddress, getAddressByUserId, updateAddressById } from '@services/address';
import { vibrate } from '@services/globalService';
import { useSelector, useDispatch } from 'react-redux';
import $ from 'jquery';
import { showSuccess } from '@context/actions';

type AddressModalProps = {
    handleClose: any,
    loggedInUserData: any
}
const AddressModal: FC<AddressModalProps> = ({ handleClose, loggedInUserData }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [open, setOpen] = useState(true);
    const [initialMarkerPosition, setInitialMarkerPosition] = useState<any>();
    const [activeAddressType, setActiveAddressType] = useState('Home');
    const [error, setError] = useState('')
    const [landmark, setLandmark] = useState('')
    const [houseFlat, setHouseFlat] = useState('');
    const [autocompletePlaceHolder, setAutocompletePlaceHolder] = useState<any>('')
    const [isNewAddress, setIsNewAddress] = useState(false);
    const [selectedAddressObj, setselectedAddressObj] = useState<any>(null);
    const [userAddresses, setUserAddresses] = useState<any[]>([]);


    //ghet user addresses on load
    useEffect(() => {
        if (loggedInUserData) {
            getAddressByUserId(loggedInUserData.key).subscribe((response: any) => {
                console.log('available user addresses :', response)
                setUserAddresses(response);
            })
        }
    }, [])

    useEffect(() => setError(''), ([selectedAddressObj, landmark, activeAddressType, houseFlat, userAddresses]))
    //on address data change check for changes address data is for new address or wxisting address
    useEffect(() => {
        if (userAddresses.length != 0) {
            let savedAddDetails = userAddresses.filter((data: any) => data.type == activeAddressType);
            if (savedAddDetails.length == 0) setIsNewAddress(true);
            else setIsNewAddress(false);
        } else setIsNewAddress(true);
    }, [activeAddressType])

    //on address data change check for changes address data is for new address or wxisting address
    const checkForAddresForUpdate = () => {
        return new Promise((res, rej) => {
            if (selectedAddressObj && selectedAddressObj.formattedAddress && userAddresses.length != 0) {
                let savedAddDetails = userAddresses.filter((data: any) => data.type == activeAddressType);
                if (savedAddDetails.length != 0) {
                    if (savedAddDetails[0].landmark != landmark || savedAddDetails[0].houseFlat != houseFlat || savedAddDetails[0].formattedAddress != selectedAddressObj.formattedAddress) {
                        res(true);
                    } else res(false);
                } else res(false);
            } else res(false);
        })
    }
    const onClose = (data: any = null) => {
        handleClose(data);
        setOpen(false);
    }

    // autocomplete response
    const handleAutocompleteSuccess = (address: AddressType) => {
        if (address) {
            setInitialMarkerPosition(address.latLng)
            // console.log("handleAutocompleteSuccess", address)
        }
    }

    // location picker response
    const handleLocationPickerSuccess = (address: any) => {
        // console.log("handleLocationPickerSuccess", address)
        if (address) {
            const autoCompValue = {
                "label": address.formatted_address,
                "value": {
                    "description": address.formatted_address,
                    "matched_substrings": [{ "length": 10, "offset": 0 }],
                    "place_id": address.place_id,
                    "reference": address.place_id,
                    "structured_formatting": {
                        "main_text": address.formatted_address,
                        "main_text_matched_substrings": [],
                        "secondary_text": address.formatted_address,
                        "secondary_text_matched_substrings": []
                    },
                    "terms": [{ "offset": 0, "value": address.formatted_address }],
                    "types": ["route", "geocode"]
                }
            }
            setAutocompletePlaceHolder(autoCompValue);
            let addressObj = setAddressObj(address, activeAddressType);
            setselectedAddressObj(addressObj);
            console.log('final address :', addressObj)
        }
    }

    const updateUserAddress = () => {
        if (!landmark) {
            setError('landmark');
            $('.landmark-input').addClass('shaker');
            setTimeout(function () {
                $('.landmark-input').removeClass('shaker');
            }, 300);
            vibrate();
            return;
        } else if (!houseFlat) {
            setError('houseFlat');
            $('.houseFlat-input').addClass('shaker');
            setTimeout(function () {
                $('.houseFlat-input').removeClass('shaker');
            }, 300);
            vibrate();
            return;
        } else {
            const currentAddressObj = { ...selectedAddressObj, userId: loggedInUserData.key, landmark, houseFlat };
            checkForAddresForUpdate().then((res) => {
                if (res) {
                    let savedAddDetails = userAddresses.filter((data: any) => data.type == activeAddressType);
                    updateAddressById(savedAddDetails[0].key, currentAddressObj).subscribe((response) => {
                        console.log('address updated');
                        dispatch(showSuccess(`Address Updated Successfully`));
                        onClose({ selectedAddressId: savedAddDetails[0].key, ...currentAddressObj })
                    })
                } else {
                    addAddress(currentAddressObj).subscribe((newAddId: any) => {
                        dispatch(showSuccess(`Address Added Successfully`));
                        onClose({ selectedAddressId: newAddId, ...currentAddressObj })
                    })
                }
            })
        }
    }

    const cancelResetAddress = () => {

    }
    return (
        <div className="address-wrap-outer">
            <Dialog
                TransitionComponent={Transition}
                disableEnforceFocus={true}
                onClose={onClose}
                open={open}
                disableBackdropClick={true}
                disableEscapeKeyDown={true}
                className="modal-outer address-wrap-modal"
            >
                <div className="modal-content address-container">
                    <div className="sticky-wrap ps-sticky t-l-0">
                        <div className="modal-header">
                            <div className="modal-back-btn" onClick={() => onClose()}>
                                <SvgIcon icon="back" color="#001871" fontSize={20} />
                            </div>
                            <h3 className="modal-heading">Save service address</h3>
                        </div>
                    </div>
                    <div className="modal-body">
                        <div className="inner-content">

                            <div className="map-element-wrap">
                                <GoogleMapLocationPicker
                                    initialMarkerPosition={initialMarkerPosition}
                                    isNewAddress={isNewAddress}
                                    handleLocationPickerSuccess={(e: any) => handleLocationPickerSuccess(e)}
                                />
                            </div>

                            <div className="addres-field-wrapp">
                                <div className="autocomplete-wrap">
                                    <GoogleAutocomplete
                                        autocompletePlaceHolder={autocompletePlaceHolder}
                                        handleAutocompleteSuccess={(address: any) => handleAutocompleteSuccess(address)}
                                        isValidate={true}
                                    />
                                </div>
                                <div className="input-wrap-outer">
                                    {selectedAddressObj && <div className="address-note">
                                        <div className="label">Selected location</div>
                                        {selectedAddressObj.formattedAddress}
                                    </div>}
                                    {/* <div className="address-note">A detailed address will help our servicemen reach your doorstep easily</div> */}
                                    <div className="input-wrap">
                                        <div className="input-label">Landmark</div>
                                        <input
                                            className={error == 'landmark' ? 'landmark-input invalid-input' : 'landmark-input'}
                                            autoComplete="off"
                                            value={landmark}
                                            onChange={(e) => setLandmark(e.target.value)}
                                            placeholder="Enter nearby popular place*"
                                        />
                                        {error == 'landmark' && <div className="error">Please enter landmark</div>}
                                    </div>
                                    <div className="input-wrap">
                                        <div className="input-label">House or Flat or Block Number</div>
                                        <input
                                            className={error == 'houseFlat' ? 'houseFlat-input invalid-input' : 'houseFlat-input'}
                                            autoComplete="off"
                                            value={houseFlat}
                                            onChange={(e) => setHouseFlat(e.target.value)}
                                            placeholder="Enter your House / Flat / Block Number*"
                                        />
                                        {error == 'houseFlat' && <div className="error">Please enter house or flat number</div>}
                                    </div>

                                    <div className="address-type-wrap d-f-ac">
                                        <div className="address-type d-f-ac" >
                                            <div className={`${activeAddressType == 'Home' ? 'active' : ''} type d-f-ac`} onClick={() => setActiveAddressType('Home')}>
                                                <div className="d-f-ac"><SvgIcon fontSize={20} icon="home2" color="white" /></div>
                                                <div className="text">Home</div>
                                            </div>
                                        </div>
                                        <div className="address-type d-f-ac" >
                                            <div className={`${activeAddressType == 'Work' ? 'active' : ''} type d-f-ac`} onClick={() => setActiveAddressType('Work')}>
                                                <div className="d-f-ac"><SvgIcon fontSize={20} icon="work" color="white" /></div>
                                                <div className="text">Work</div>
                                            </div>
                                        </div>
                                        <div className="address-type d-f-ac" >
                                            <div className={`${activeAddressType == 'Other' ? 'active' : ''} type d-f-ac`} onClick={() => setActiveAddressType('Other')}>
                                                <div className="d-f-ac"><SvgIcon fontSize={20} icon="location2" color="white" /></div>
                                                <div className="text">Other</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <div className="f-btn-wrap d-f-ac">
                                        <div className="clearfix action-btn-outer d-f-ac">
                                            <div className="clearfix action-btn-wrap" onClick={updateUserAddress}>
                                                <div className="action-btn-icon">
                                                    <SvgIcon icon="userLocation" />
                                                </div>
                                                <div className="action-btn-text">Save & Continue</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default AddressModal;
