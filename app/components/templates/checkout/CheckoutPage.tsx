import { DetectMob } from '@util/DetectUserAgent';
import React, { FC, useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import SvgIcon from '@element/svgIcon';
import { getValueFromLocalStorage, removeItemFromLocalStorage, setValueInLocalStorage } from '@services/webstorage';
import { updateBookingItems } from '@context/actions/booking';
import { getConvenienceFee, vibrate } from '@services/globalService';
import { windowRef } from '@services/window';
import $ from 'jquery';
import { getDaysArray, getTimeSlot } from '@util/utils';
import { disableLoader, enableLoader, showError, updateLoggedInUserData } from '@context/actions';
import { AddressType } from '@type/common';
import EmptyCart from '@module/emptyCart/EmptyCart';
import UserRegistrationModal from '@template/modal/userRegistration/userRegistrationModal';
import { uploadImage } from '@services/upload';
import { getBookingCount, saveBooking } from '@services/booking';
import AddressModal from '@template/modal/address/addressModal';
import { isMobile } from 'react-device-detect';
import { PRIMARY_COLOUR } from '@constant/defaultValues';
import { getUserById } from '@services/users';
import { getAddressByUserId } from '@services/address';

const CheckoutPage: FC<any> = ({ categories, curations }) => {
    const dispatch = useDispatch();
    const dateTimeContainer = React.useRef<HTMLDivElement>(null);
    const profileContainer = React.useRef<HTMLDivElement>(null);
    const addressContainer = React.useRef<HTMLDivElement>(null);
    const orderSummaryContainer = React.useRef<HTMLDivElement>(null);

    const [dateTimeContainerHeight, setDateTimeContainerHeight] = useState(0);
    const [profileContainerHeight, setProfileContainerHeight] = useState(0);
    const [addressContainerHeight, setAddressContainerHeight] = useState(0);
    const [orderSummaryContainerHeight, setOrderSummaryContainerHeight] = useState(0);

    const [checkoutSteps, setCheckoutSteps] = useState([
        { name: 'Date & Time', active: false, id: 0 },
        { name: 'Profile Details', active: false, id: 1 },
        { name: 'Address', active: false, id: 2 },
        { name: 'Order Summary', active: false, id: 3 },
    ])
    const cartBookingItems: any[] = useSelector((state: any) => state.booking.items);
    const loggedInUserData: any = useSelector((state: any) => state.user);
    const [enteredPhoneNumber, setEnteredPhoneNumber] = useState<any>('');
    const [minDate, setMinDate] = useState(new Date());
    const [maxDate, setMaxDate] = useState(new Date(Date.now() + 12096e5));//12096e5 is a magic number which is 14 days in milliseconds.
    const [officeTimeSlots, setOfficeTimeSlots] = useState<any[]>([])
    const [otherThanOfficeTimeSlots, setOtherThanOfficeTimeSlots] = useState<any[]>([])
    const [slotsArray, setSlotsArray] = useState<any[]>([])
    const [datesArray, setDatesArray] = useState<any[]>([])
    const [selectedDate, setSelectedDate] = useState<any>('')
    const [selectedSlot, setSelectedSlot] = useState<any>(null)
    const [isAnyEmergencyServiceAvl, setIsAnyEmergencyServiceAvl] = useState(false)
    const [isOtherThanEmergencyServiceAvl, setIsOtherThanEmergencyServiceAvl] = useState(false)
    const [finalSubTotal, setFinalSubTotal] = useState(0);
    const [convenienceChargesTotal, setConvenienceChargesTotal] = useState(0);
    const [taxes, setTaxes] = useState([{ name: 'GST', value: 18, total: 0 }]);
    const [total, setTotal] = useState(0);
    const [selectedLocation, setSelectedLocation] = useState<any>()
    const [tncChecked, setTncChecked] = useState(false);
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
    const [invoiceId, setInvoiceId] = useState('')
    const [remark, setRemark] = useState('')
    const [isAnyServiceToRemove, setIsAnyServiceToRemove] = useState(false);
    const [userAddresses, setUserAddresses] = useState<any[]>([]);

    useEffect(() => {
        if (windowRef) {
            //set for desktop
            if (!DetectMob()) setActiveChkStep(0);

            const percistedUserId = getValueFromLocalStorage('user') || '';
            if (percistedUserId && !loggedInUserData) {
                getUserById(percistedUserId).subscribe((response: any) => {
                    if (response) {
                        dispatch(updateLoggedInUserData(response));
                    }
                })
                dispatch(updateBookingItems(percistedUserId ? percistedUserId : []));
            }

            const percistedItems = getValueFromLocalStorage('bookingItems');
            dispatch(updateBookingItems(percistedItems ? percistedItems : []));

            let updatedSlotsArray = getTimeSlot(new Date()) || [];
            let updatedDatesArray = getDaysArray(minDate, maxDate) || [];
            setSlotsArray(updatedSlotsArray);

            if (slotsArray.length != 0) {
                let activeSlots = slotsArray.filter((slot) => slot.active);
                if (activeSlots.length == 0) {
                    setMinDate(new Date(minDate.setDate(minDate.getDate() + 1)));
                    updatedDatesArray = getDaysArray(minDate, maxDate) || [];
                }
            }
            setDatesArray(updatedDatesArray);

        }
        window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }, [windowRef]);

    useEffect(() => {
        if (cartBookingItems.length != 0) {
            let isAnyEmergencyServiceAvlCopy = cartBookingItems.filter((bookingItemData) => bookingItemData.isEmgSer);
            setIsAnyEmergencyServiceAvl(isAnyEmergencyServiceAvlCopy.length != 0);

            let isOtherThanEmergencyServiceAvl = cartBookingItems.filter((bookingItemData) => !bookingItemData.isEmgSer);
            setIsOtherThanEmergencyServiceAvl(isAnyEmergencyServiceAvlCopy ? isOtherThanEmergencyServiceAvl.length != 0 : false);
        }
        calculateTotal();
    }, [cartBookingItems])

    useEffect(() => {
        if (loggedInUserData) {
            setEnteredPhoneNumber(loggedInUserData.phone);
            getAddressByUserId(loggedInUserData.key).subscribe((response: any) => {
                if (response.length != 0) {
                    setUserAddresses(response);
                    // setSelectedLocation(response[0]);
                }
                console.log('userAddress :', response)
            })
        }
    }, [loggedInUserData]);

    useEffect(() => {
        setDynamicHeights();
    }, [checkoutSteps, userAddresses, loggedInUserData, total, slotsArray, selectedSlot, cartBookingItems, selectedLocation])

    useEffect(() => {
        let officeTimeSlotsRef = slotsArray.filter((slot) => slot.active && slot.officeTimeSlot);
        let otherThanOfficeTimeSlotsRef = slotsArray.filter((slot) => slot.active && !slot.officeTimeSlot);
        setOfficeTimeSlots(officeTimeSlotsRef);
        setOtherThanOfficeTimeSlots(otherThanOfficeTimeSlotsRef);
    }, [slotsArray])

    useEffect(() => {
        if (selectedDate) {
            let updatedSlotsArray = getTimeSlot(selectedDate.newDate);
            setSlotsArray(updatedSlotsArray);
        }
    }, [selectedDate])

    //check for any service to remove
    useEffect(() => {
        if (selectedSlot && isOtherThanEmergencyServiceAvl) {
            let isAnyServiceToRemoveAvl = cartBookingItems.filter((item: any) => !selectedSlot.officeTimeSlot && !item.isEmgSer)
            setIsAnyServiceToRemove(isAnyServiceToRemoveAvl.length != 0 ? true : false);
        } else setIsAnyServiceToRemove(false)
    }, [selectedSlot, selectedDate])

    const setActiveChkStep = (index: number) => {
        let checkoutStepsCopy = [...checkoutSteps];
        checkoutStepsCopy.map((stepData, i) => {
            if (i == index) {
                stepData.active = stepData.active ? false : true;
            } else stepData.active = false;
        })
        setCheckoutSteps(checkoutStepsCopy);
    }

    const onAddressStepClick = (checkoutStepsIndex: number) => {
        if (loggedInUserData) {
            setActiveChkStep(checkoutStepsIndex);
        } else {
            dispatch(showError("Seems like you'r not logged in yet! Please login first.", 4000));
            let activeStep = checkoutSteps.filter((step) => step.active);
            let activeStepId = activeStep.length != 0 ? activeStep[0].id : null;
            if (activeStepId != 1) setActiveChkStep(checkoutStepsIndex - 1);
        }
    }

    const setActiveDate = (index: number) => {
        let datesArrayCopy = [...datesArray];
        datesArrayCopy.map(async (dateData: any, i: number) => {
            if (i == index) {
                dateData.isSelected = true;
                setSelectedDate(dateData);
                setSelectedSlot(null);
            } else dateData.isSelected = false;
            if (i == datesArrayCopy.length - 1) {
                setDatesArray(datesArrayCopy);
            }
        })
        vibrate();
    }

    const setActiveSlot = (index: number, from: string) => {
        let officeTimeSlotCopy = [...officeTimeSlots];
        let otherThanOfficeTimeSlotsCopy = [...otherThanOfficeTimeSlots];

        if (from == 'regular') {
            officeTimeSlotCopy.map((dateData, i) => {
                if (i == index) {
                    dateData.isSelected = true;
                    setSelectedSlot(dateData);
                } else dateData.isSelected = false;
            })
            otherThanOfficeTimeSlotsCopy.map((dateData) => dateData.isSelected = false)
        } else if (from == 'extra') {
            otherThanOfficeTimeSlotsCopy.map((dateData, i) => {
                if (i == index) {
                    dateData.isSelected = true;
                    setSelectedSlot(dateData);
                } else dateData.isSelected = false;
            })
            officeTimeSlotCopy.map((dateData) => dateData.isSelected = false);
        } else {
            otherThanOfficeTimeSlotsCopy.map((dateData) => dateData.isSelected = false)
            officeTimeSlotCopy.map((dateData) => dateData.isSelected = false)
        }
        calculateTotal();
        setOfficeTimeSlots(officeTimeSlotCopy);
        setOtherThanOfficeTimeSlots(otherThanOfficeTimeSlotsCopy);
        vibrate();
    }

    const setDynamicHeights = () => {
        let activeStep = checkoutSteps.filter((step) => step.active);
        let activeStepId = activeStep.length != 0 ? activeStep[0].id : null;
        setTimeout(() => {
            var dateTimeContainerRef = activeStepId == 0 && dateTimeContainer && dateTimeContainer.current ? dateTimeContainer?.current?.offsetHeight : 0;
            setDateTimeContainerHeight(dateTimeContainerRef);
            var profileContainerRef = activeStepId == 1 && profileContainer && profileContainer.current ? profileContainer?.current.offsetHeight : 0;
            setProfileContainerHeight(profileContainerRef);
            var addressContainerRef = activeStepId == 2 && addressContainer && addressContainer.current ? addressContainer?.current.offsetHeight : 0;
            setAddressContainerHeight(addressContainerRef);
            var orderSummaryContainerRef = activeStepId == 3 && orderSummaryContainer && orderSummaryContainer.current ? orderSummaryContainer?.current.offsetHeight : 0;
            setOrderSummaryContainerHeight(orderSummaryContainerRef);
        });
    }

    const replaceBookingItems = (data: any) => {
        let cartBookingItemsCopy = [...data];
        setValueInLocalStorage("bookingItems", cartBookingItemsCopy);
        dispatch(updateBookingItems(cartBookingItemsCopy));
    }

    const getBookingDate = () => {
        var time12h = selectedSlot.name;
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') {
            hours = '00';
        }
        if (modifier === 'PM') {
            hours = parseInt(hours, 10) + 12;
        }
        let date = new Date(selectedDate.newDate);
        return new Date(date.setHours(hours, minutes, 0));
    }

    const calculateTotal = () => {
        // dispatch(enableLoader());
        let finalSubTotalCopy = 0;
        let convenienceChargesTotalCopy = 0;
        let totalCopy = 0;
        let taxesCopy = [{ name: 'GST', value: 18, total: 0 }];
        let cartBookingItemsCopy = [...cartBookingItems];
        let bookingDate = selectedSlot && selectedDate ? getBookingDate() : new Date();
        getConvenienceFee(cartBookingItemsCopy, categories, curations, bookingDate).then((convFeeArray: any) => {
            cartBookingItemsCopy.map((bookingItem, index) => {
                let currentTotal = 0;
                if (bookingItem.isAnyTypeAvailableForService) {
                    bookingItem.types.map((typeItem: any) => {
                        currentTotal += typeItem.quantity * typeItem.rate;
                    })
                    bookingItem.total = currentTotal;
                } else {
                    bookingItem.total = bookingItem.quantity * bookingItem.rate;
                }
                bookingItem.tax = Number(((bookingItem.total / 100) * taxesCopy[0].value).toFixed(2));
                taxesCopy[0].total = Number((taxesCopy[0].total + Number(((bookingItem.total / 100) * taxesCopy[0].value).toFixed(2))).toFixed(2));
                finalSubTotalCopy += bookingItem.total;
                totalCopy = Number((finalSubTotalCopy + taxesCopy[0].total).toFixed(2));

                bookingItem.convenienceFee = convFeeArray[index];
                convenienceChargesTotalCopy += convFeeArray[index];
                totalCopy = Number((totalCopy + convenienceChargesTotalCopy).toFixed(2));
                if (index == cartBookingItemsCopy.length - 1) {
                    if (total != totalCopy) {
                        dispatch(disableLoader());
                        setConvenienceChargesTotal(convenienceChargesTotalCopy);
                        replaceBookingItems(cartBookingItemsCopy);
                        setFinalSubTotal(finalSubTotalCopy);
                        setTotal(totalCopy);
                        setTaxes(taxesCopy);
                    }
                }
            })
        })
    }

    const removeServices = () => {
        if (!selectedDate) {
            $('#date-wrap').addClass('shaker');
            setTimeout(function () {
                $('#date-wrap').removeClass('shaker');
            }, 300);
        } else {
            dispatch(enableLoader())
            let cartBookingItemsCopy = [...cartBookingItems];
            cartBookingItemsCopy.map((bookingItem: any, index: number) => {
                if (!bookingItem.isEmgSer) {
                    cartBookingItemsCopy.splice(index, 1);
                }
                if (index == cartBookingItemsCopy.length - 1) {
                    setActiveChkStep(1);
                    dispatch(disableLoader());
                    replaceBookingItems(cartBookingItemsCopy);
                }
            })
        }
    }

    const submitDateTime = () => {
        if (!selectedDate) {
            $('#date-wrap').addClass('shaker');
            setTimeout(function () {
                $('#date-wrap').removeClass('shaker');
            }, 300);
        } else if (!selectedSlot) {
            $('.interval-wrap').addClass('shaker');
            setTimeout(function () {
                $('.interval-wrap').removeClass('shaker');
            }, 300);
        } else if (isOtherThanEmergencyServiceAvl && !selectedSlot.officeTimeSlot) {
            $('.unserviceable-service').addClass('shaker');
            setTimeout(function () {
                $('.unserviceable-service').removeClass('shaker');
            }, 300);
        } else {
            // calculateTotal();
            setActiveChkStep(1);
        }
    }

    const submitProfile = () => {
        setActiveChkStep(2);
    }

    const submitAddress = () => {
        if (!selectedLocation || !selectedLocation.formattedAddress) {
            $('#address-wrap').addClass('shaker');
            setTimeout(function () {
                $('#address-wrap').removeClass('shaker');
            }, 300);
        } else {
            setActiveChkStep(3);
        }
    }

    const onPhoneChange = (number: string, from: any = '') => {
        const num: any = number.charAt(number?.length - 1).replace(".", '');
        if ((((num && num != ' ') && !isNaN(num)) || number?.length == 0) && number?.length <= 10) {
            setEnteredPhoneNumber(number);
        }
    }

    const onPhoneInputEnterPress = (e: any) => {
        if (e.key == 'Enter') loginUser();
    }

    const loginUser = () => {
        if (!enteredPhoneNumber) {
            $('#phone-number-wrap').addClass('shaker');
            setTimeout(function () {
                $('#phone-number-wrap').removeClass('shaker');
            }, 300);
        } else if (enteredPhoneNumber.toString().length != 10) {
            $('#phone-number-wrap').addClass('shaker');
            setTimeout(function () {
                $('#phone-number-wrap').removeClass('shaker');
            }, 300);
        } else {
            setIsRegistrationModalOpen(true);
        }
    }

    const scrollToElement = (element: any, step: any) => {
        var elmntToView = element;
        var headerOffset = 45;
        var elementPosition = elmntToView.getBoundingClientRect().top;
        var offsetPosition = elementPosition - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });

        setActiveChkStep(step);
        if (step == 0) {
            setTimeout(() => {
                submitDateTime();
            }, 1000);
        }
        if (step == 1) {
            setTimeout(() => {
                $('#phone-number-wrap').addClass('shaker');
                setTimeout(function () {
                    $('#phone-number-wrap').removeClass('shaker');
                }, 300);
            }, 1000);
        }
        if (step == 2) {
            setTimeout(() => {
                submitAddress();
            }, 1000);
        }
    }

    const submitBooking = () => {
        if (!selectedDate || !selectedSlot || (isOtherThanEmergencyServiceAvl && !selectedSlot.officeTimeSlot)) {
            var elmntToView = document.getElementById("date-time-outer");
            scrollToElement(elmntToView, 0);
        } else if (!enteredPhoneNumber) {
            var elmntToView = document.getElementById("user-profile-outer");
            scrollToElement(elmntToView, 1);
        } else if (!loggedInUserData) {
            var elmntToView = document.getElementById("user-profile-outer");
            scrollToElement(elmntToView, 1);
            // alert("Not logged in");
        } else if ((!selectedLocation || !selectedLocation.formattedAddress)) {
            var elmntToView = document.getElementById("address-details-outer");
            scrollToElement(elmntToView, 2);
        } else if (!tncChecked) {
            $('#tnc-wrap').addClass('shaker');
            setTimeout(function () {
                $('#tnc-wrap').removeClass('shaker');
            }, 300);
        } else {
            //actual booking creation flow start here
            dispatch(enableLoader());
            // createBooking();
        }
    }

    const onAddressSelection = (selectedAddress: AddressType) => {
        if (selectedAddress) {
            console.log(selectedAddress);
            setSelectedLocation(selectedAddress);
        }
    }

    const handleUserRegistrationResponse = (userData: any) => {
        console.log(userData)
        if (userData) {

        }
    }

    const imageUpload = (fileData: any) => {
        return new Promise((resolve, reject) => {
            uploadImage(fileData.url, 'booking', '').subscribe((uploadedUrl) => {
                resolve({ uploadedUrl: uploadedUrl, key: fileData.key });
            });
        });
    }
    const getBookingId = () => {
        getBookingCount().subscribe((avlBookings: any) => {
            let bookingToken = "TKBAA";
            let bookingCount = (avlBookings + 1).toString();
            while (bookingCount.length < 4) {
                bookingCount = '0' + bookingCount;
            }
            setInvoiceId((bookingToken + bookingCount));
        })
    }
    const addressModalSuccess = (selectedAddressObj: any) => {
        setSelectedLocation(selectedAddressObj);
        setIsAddressModalOpen(false);
        getAddressByUserId(loggedInUserData.key).subscribe((response: any) => {
            setUserAddresses(response);
            console.log('userAddress :', response)

        })
        console.log('selectedAddress :', selectedLocation)
    }
    // const createBooking = () => {
    //     // create uniqe invoice id 
    //     getBookingId();
    //     // first create new entry for address 
    //     // this check is due to realtime data issue -- if change in db related address this api get called and further logic will run after that so if order placed then remove all cartBookingItems so it avoid belonging logic to run 
    //     if (cartBookingItems && cartBookingItems.length != 0) {
    //         // check for any image selected 
    //         if (this.uploadableImgArray.length != 0) {
    //             // if any img selected then save it to db and then return its downloadable url to booking item
    //             Promise.all(
    //                 // if any img selected then save it to db
    //                 uploadableImgArray.map(async (fileData: any) => {
    //                     const content = await imageUpload(fileData);
    //                     return content;
    //                 }))
    //                 .then(imageUrlArray => {
    //                     // if any img selected then save its downloadable url to booking item
    //                     let uplodedImageArray: any = imageUrlArray;
    //                     cartBookingItems.map((data) => {
    //                         let imgUrl = uplodedImageArray.filter((uploadableData: any) => uploadableData.key == data.key);
    //                         (imgUrl.length != 0) ? (data.file = [imgUrl[0].uploadedUrl]) : (data.file = null);
    //                     })
    //                     var addressInterval = setInterval(() => {
    //                         if (invoiceId) {
    //                             clearInterval(addressInterval);
    //                             // upload booking data to db
    //                             uploadBookingData()
    //                         }
    //                     })
    //                 })
    //                 .catch((err) => {
    //                     console.log(err);
    //                 });
    //         } else {
    //             // if any img not selected then directly upload booking data to db
    //             var addressInterval = setInterval(() => {
    //                 if (invoiceId) {
    //                     clearInterval(addressInterval);
    //                     // upload booking data to db
    //                     uploadBookingData()
    //                 }
    //             })
    //         }
    //     }
    // }
    const uploadBookingData = () => {
        if (cartBookingItems && cartBookingItems.length != 0) {
            let bookingData = {
                status: 'Placed',
                invoiceId: invoiceId,
                services: cartBookingItems,
                uId: loggedInUserData.key,
                bookingDate: getBookingDate(),
                addressId: selectedLocation.selectedAddressId,
                formattedAddress: selectedLocation?.formattedAddress,
                phone: enteredPhoneNumber,
                remark: remark,
                tAndc: tncChecked,
                taxes: taxes,
                subTotal: finalSubTotal.toFixed(2),
                convenienceCharges: convenienceChargesTotal.toFixed(2),
                total: total.toFixed(2),
                paidAmount: 0,
                equipmentTotal: 0,
                settledAmount: total.toFixed(2),
                paymentStatus: 'Pending',
            }

            saveBooking(bookingData).subscribe((res) => {
                dispatch(disableLoader())
                // sendInAppNotificationToUser('Placed', bookingData, this.loggedInUserData).subscribe(() => { });
                // $('#confirmationModalCart').modal('show', { backdrop: 'static', keyboard: false })
                windowRef.confirmationResult = null;
                dispatch(updateBookingItems([]));
                removeItemFromLocalStorage('bookingItems');
            });
        }
    }

    return (
        <div className="checkout-page-wrap">
            {cartBookingItems.length != 0 ?
                <div className="container clearfix">
                    <div className="width100" >
                        <h2 className="primary-heading heading-bottom-border m-z">Complete Booking</h2>
                    </div>
                    <div className="checkout-steps-outer-wrap">
                        <div className="checkout-steps-outer width100 clearfix">
                            {checkoutSteps.map((checkoutStep: any, checkoutStepIndex: number) => {
                                return <div className="width100 clearfix" key={checkoutStepIndex}>
                                    {(checkoutStepIndex == 3 ? isMobile : true) && <div className="checkout-step-wrap width100 clearfix">

                                        {/* <!-- // date and time --> */}
                                        {checkoutStepIndex == 0 && <div className="date-time-outer" id="date-time-outer">
                                            <div className="step-heading width100 clearfix" onClick={() => setActiveChkStep(checkoutStepIndex)}>
                                                <div className="stepCount">
                                                    <div className={checkoutStep.active ? 'activestep' : ''}>{checkoutStepIndex + 1}</div>
                                                </div>
                                                <div className="step-name">{checkoutStep.name}</div>
                                                <div className={checkoutStep.active ? "expand-icon expanded" : 'expand-icon'}>
                                                    <SvgIcon icon="expand" color={PRIMARY_COLOUR} />
                                                </div>
                                            </div>
                                            <div className={checkoutStep.active ? "step-content step-content-expanded width100" : 'step-content width100'} style={{ height: checkoutStep.active ? dateTimeContainerHeight : 0 }}>
                                                <div className="width100" ref={dateTimeContainer}>
                                                    <div className="width100 dates-outer" id="date-wrap">
                                                        {datesArray.map((date: any, dateIndex: number) => {
                                                            return <div key={dateIndex} className={date.isSelected ? "date-wrap clearfix activeDate" : 'date-wrap clearfix'} onClick={() => setActiveDate(dateIndex)}>
                                                                <div className="date-item month">{date.month}</div>
                                                                <div className="date-item date">{date.date}</div>
                                                                <div className="date-item day">{date.day}</div>
                                                            </div>
                                                        })}
                                                    </div>
                                                    {officeTimeSlots && officeTimeSlots.length != 0 && isAnyEmergencyServiceAvl && <div className="slot-type-name width100">Regular Timing</div>}
                                                    <div className="interval-wrap dates-outer width100 clearfix" id="time-wrap">
                                                        {officeTimeSlots.map((slot: any, slotIndex: number) => {
                                                            return <div key={slotIndex} className={slot.isSelected ? "interval-item activeDate" : 'interval-item'} onClick={() => setActiveSlot(slotIndex, 'regular')}><div>{slot.name}</div></div>
                                                        })}
                                                    </div>
                                                    {otherThanOfficeTimeSlots && otherThanOfficeTimeSlots.length != 0 && isAnyEmergencyServiceAvl && <div className="slot-type-name width100">Emergency Timing</div>}
                                                    <div className="interval-wrap dates-outer width100 clearfix">
                                                        {otherThanOfficeTimeSlots.map((slot: any, slotIndex: number) => {
                                                            return <div key={slotIndex} className={slot.isSelected ? "interval-item activeDate" : 'interval-item'} onClick={() => setActiveSlot(slotIndex, 'extra')}>
                                                                <div>{slot.name}</div></div>
                                                        })}
                                                    </div>

                                                    {isOtherThanEmergencyServiceAvl && selectedSlot && !selectedSlot.officeTimeSlot && <div className="unserviceable-service unserviceable-service-wrap">
                                                        <div className="unserviceable-service-title">Bellow services in your booking which are not serviceable for selected timing {selectedSlot.name}. You can continue by removing these services from booking or change booking time.</div>
                                                        {cartBookingItems.map((item: any, itemIndex: number) => {
                                                            return <div className="width100 item-list-container" key={itemIndex}>
                                                                {!item.isEmgSer && <div className="width100 items-wrap">
                                                                    <div className="item-content">
                                                                        <div className="category clearfix">
                                                                            <div className="category-name d-ib">{item.categoryName}</div>
                                                                            <div className="price d-ib">₹ {item.total}</div>
                                                                        </div>
                                                                        <div className="service">
                                                                            <div className="clearfix width100">
                                                                                <div className="service-name d-ib">{item.name}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {item.isAnyTypeAvailableForService && <div className="types-list">
                                                                            {item.types.map((type: any, tipeIndex: number) => {
                                                                                return <div className="type" key={tipeIndex}>
                                                                                    <div className="clearfix width100">
                                                                                        <div className="service-name">
                                                                                            {type.name}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            })}
                                                                        </div>}
                                                                    </div>
                                                                </div>}
                                                            </div>
                                                        })}
                                                    </div>}

                                                    <div className="chekout-step-footer-btn" style={{ paddingTop: '10px' }}>
                                                        <div className="width60 selectedDateTime-wrap" style={{ width: isAnyServiceToRemove ? '60%' : '70%' }}>
                                                            <div className="selectedDateTime">
                                                                {selectedDate && <div className="d-ib date">
                                                                    {selectedDate.date} {selectedDate.month}, {selectedDate.day}
                                                                </div>}
                                                                {selectedSlot && <div className="d-ib time">{selectedSlot.name}</div>}
                                                            </div>
                                                        </div>
                                                        {!isAnyServiceToRemove && <div className="date-submit-wrap width30 clearfix">
                                                            <div className="clearfix action-btn-wrap" onClick={submitDateTime}>
                                                                <div className="action-btn-icon">
                                                                    <SvgIcon icon="next" />
                                                                </div>
                                                                <div className="action-btn-text">Next</div>
                                                            </div>
                                                        </div>}
                                                        {isAnyServiceToRemove && <div className="date-submit-wrap width40 clearfix  unserviceable-service">
                                                            <div className="clearfix action-btn-wrap" onClick={removeServices}>
                                                                <div className="action-btn-icon">
                                                                    <SvgIcon icon="remove" />
                                                                </div>
                                                                <div className="action-btn-text">Remove Services</div>
                                                            </div>
                                                        </div>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>}

                                        {/* <!-- // profile  --> */}
                                        {checkoutStepIndex == 1 && < div className="user-profile-outer" id="user-profile-outer">
                                            <div className="step-heading width100 clearfix" onClick={() => setActiveChkStep(checkoutStepIndex)}>
                                                <div className="stepCount">
                                                    <div className={checkoutStep.active ? "activestep" : ''}>{checkoutStepIndex + 1}</div>
                                                </div>
                                                <div className="step-name">{checkoutStep.name}</div>
                                                <div className={checkoutStep.active ? 'expand-icon expanded' : 'expand-icon'}>
                                                    <SvgIcon icon="expand" color={PRIMARY_COLOUR} />
                                                </div>
                                            </div>
                                            <div className={checkoutStep.active ? "step-content-expanded step-content" : 'step-content'}
                                                style={{ height: checkoutStep.active ? profileContainerHeight : 0 }}>
                                                <div className="width100 clearfix" ref={profileContainer}>
                                                    {loggedInUserData && <div className="profile-details">
                                                        <div className="profile-outer">
                                                            <div className="user-details">
                                                                <div className="user-name width100">{loggedInUserData.name}</div>
                                                                <div className="user-phone">{loggedInUserData.phone}</div>
                                                                <div className="user-email">{loggedInUserData.email}</div>
                                                            </div>
                                                        </div>
                                                        <div className="chekout-step-footer-btn" style={{ paddingTop: '10px' }}>
                                                            <div className="width70"></div>
                                                            <div className="date-submit-wrap width30 clearfix">
                                                                <div className="clearfix action-btn-wrap" onClick={submitProfile}>
                                                                    <div className="action-btn-icon">
                                                                        <SvgIcon icon="next" />
                                                                    </div>
                                                                    <div className="action-btn-text">Next</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>}
                                                    {!loggedInUserData && <div className="login-profile-wrap">
                                                        <div className="profile-outer">
                                                            <div className="phone-wrap" id="phone-number-wrap">
                                                                <input className="desc"
                                                                    type="tel"
                                                                    placeholder="+91 "
                                                                    value={enteredPhoneNumber}
                                                                    onChange={(e) => onPhoneChange(e.target.value)}
                                                                    onKeyPress={onPhoneInputEnterPress}
                                                                />
                                                                <div className="title">Enter phone number to login</div>
                                                            </div>
                                                        </div>
                                                        <div className="chekout-step-footer-btn" style={{ paddingTop: '10px' }}>
                                                            <div className="width70"></div>
                                                            <div className="date-submit-wrap width30 clearfix">
                                                                <div className="clearfix action-btn-wrap" onClick={loginUser}>
                                                                    <div className="action-btn-icon">
                                                                        <SvgIcon icon="login" style={{ padding: '0 4px 1px 0' }} />
                                                                    </div>
                                                                    <div className="action-btn-text">Login</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>}
                                                </div>
                                            </div>
                                        </div>}

                                        {/* <!-- // Address --> */}
                                        {checkoutStepIndex == 2 && <div className="address-details-outer" id="address-details-outer">
                                            <div className="step-heading width100 clearfix" onClick={() => onAddressStepClick(checkoutStepIndex)}>
                                                <div className="stepCount">
                                                    <div className={checkoutStep.active ? 'activestep' : ''}>{checkoutStepIndex + 1}</div>
                                                </div>
                                                <div className="step-name">{checkoutStep.name}</div>
                                                <div className={checkoutStep.active ? "expand-icon expanded" : 'expand-icon'}>
                                                    <SvgIcon icon="expand" color={PRIMARY_COLOUR} />
                                                </div>
                                            </div>
                                            <div className={checkoutStep.active ? "step-content-expanded step-content" : 'step-content'} style={{ height: checkoutStep.active ? addressContainerHeight : 0 }}>
                                                <div className="width100" ref={addressContainer}>
                                                    <div className="address-outer" id="address-wrap">
                                                        {/* saved address */}
                                                        {userAddresses.length != 0 && <div className="address-wrap" >
                                                            {userAddresses.map((address: any, addressIndex: number) => {
                                                                return <div key={addressIndex} className={selectedLocation && selectedLocation.key == address.key ? "address-details-wrap active" : "address-details-wrap"} onClick={() => onAddressSelection(address)}>
                                                                    <div className="type">{address.type}</div>
                                                                    <div className="form-add">{address.formattedAddress}
                                                                        <div className="landmark">{address.landmark}, {address.houseFlat}</div>
                                                                    </div>
                                                                </div>
                                                            })}
                                                            {!selectedLocation && <div className="title">Select your service address</div>}
                                                        </div>}
                                                        {userAddresses.length == 0 && <div className="address-wrap" >
                                                            <div className="title">You dont't have any addresses saved yet!</div>
                                                        </div>}
                                                    </div>
                                                    <div className="chekout-step-footer-btn" style={{ paddingTop: '10px' }}>

                                                        {loggedInUserData ?
                                                            <>
                                                                {userAddresses.length != 0 ?
                                                                    <>
                                                                        <div className="width70"></div>
                                                                        <div className="date-submit-wrap width30 clearfix">
                                                                            <div className="clearfix action-btn-wrap" onClick={submitAddress}>
                                                                                <div className="action-btn-icon">
                                                                                    <SvgIcon icon="next" />
                                                                                </div>
                                                                                <div className="action-btn-text">Next</div>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                    :
                                                                    <>
                                                                        <div className="width40"></div>
                                                                        <div className="date-submit-wrap width60 clearfix">
                                                                            <div className="clearfix action-btn-wrap" onClick={() => setIsAddressModalOpen(true)}>
                                                                                <div className="action-btn-icon">
                                                                                    <SvgIcon icon="addAddress" />
                                                                                </div>
                                                                                <div className="action-btn-text">Add An Address</div>
                                                                            </div>
                                                                        </div>
                                                                    </>}
                                                            </>
                                                            :
                                                            <>
                                                                {/* not loggedin  */}
                                                            </>}

                                                    </div>
                                                </div>
                                            </div>
                                        </div>}

                                        {/* <!-- // Order Summary mobile --> */}
                                        {checkoutStepIndex == 3 && < div className="order-summary-outer" id="order-summary-outer">
                                            <div className="step-heading width100 clearfix" onClick={() => setActiveChkStep(checkoutStepIndex)}>
                                                <div className="stepCount">
                                                    <div className={checkoutStep.active ? 'activestep' : ''}>{checkoutStepIndex + 1}</div>
                                                </div>
                                                <div className="step-name">{checkoutStep.name}</div>
                                                <div className={checkoutStep.active ? 'expand-icon expanded' : 'expand-icon'}>
                                                    <SvgIcon icon="expand" color={PRIMARY_COLOUR} />
                                                </div>
                                            </div>
                                            <div className={checkoutStep.active ? 'step-content step-content-expanded' : 'step-content'}
                                                style={{ height: checkoutStep.active ? orderSummaryContainerHeight : 0 }}>
                                                <div className="width100 items-outer" ref={orderSummaryContainer}>
                                                    <div className="item-list-container">
                                                        {cartBookingItems.map((item: any, index: number) => {
                                                            return <div className="width100 items-wrap" key={index}>
                                                                <div className="item-content">
                                                                    <div className="category clearfix">
                                                                        <div className="category-name d-ib">{item.categoryName}</div>
                                                                        <div className="price d-ib">₹ {item.total}</div>
                                                                    </div>
                                                                    <div className="service">
                                                                        <div className="clearfix width100">
                                                                            <div className="service-name d-ib">{item.name}</div>
                                                                        </div>
                                                                    </div>
                                                                    {item.isAnyTypeAvailableForService && <div className="types-list">
                                                                        {item.types.map((type: any, typeIndex: number) => {
                                                                            return <div className="type" key={typeIndex}>
                                                                                <div className="clearfix width100">
                                                                                    <div className="service-name">
                                                                                        {type.name}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        })}
                                                                    </div>}
                                                                    <div className="category clearfix">
                                                                        <div className="category-name d-ib">Convenience Fee</div>
                                                                        <div className="price d-ib">₹ {item.convenienceFee}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        })}
                                                    </div>
                                                    <div className="items-wrap width100 total-container" style={{ marginTop: '10px' }}>
                                                        <div className="category clearfix">
                                                            <div className="category-name d-ib">Sub Total </div>
                                                            <div className="price d-ib">₹ {finalSubTotal.toFixed(2)}</div>
                                                        </div>
                                                        <div className="subtotal clearfix">
                                                            <div className="category-name d-ib">Convenience Fee </div>
                                                            <div className="price d-ib">₹ {convenienceChargesTotal.toFixed(2)}</div>
                                                        </div>
                                                        <div className="taxes clearfix">
                                                            <div className="category-name d-ib">Taxes({taxes[0].name} {taxes[0].value}%)</div>
                                                            <div className="price d-ib">₹ {taxes[0].total.toFixed(2)}</div>
                                                        </div>
                                                        <div className="total clearfix">
                                                            <div className="category-name d-ib">Total Payable Amount </div>
                                                            <div className="price d-ib">₹ {total.toFixed(2)}</div>
                                                        </div>
                                                    </div>
                                                    <div className="items-wrap width100 final-note-wrap">
                                                        <div className="note">
                                                            <div className="width100">Required material cost is excluded from the above amount.</div>
                                                            <div className="width100">Additional charges will be adjusted against the finalbill,afterthe inspection.</div>
                                                            {isAnyEmergencyServiceAvl && <div className="width100">Convenience fee applied per service, and it will be vary on the basis of selected booking time.</div>}
                                                            {!isAnyEmergencyServiceAvl && <div className="width100">Convenience fee applied per service. </div>}
                                                            <div className="width100">Pay online after your service approval.</div>
                                                            <div className="width100">The Company is not responsible for any transaction happening between client and vendor.</div>
                                                            <div className="width100">Vendor is not authorized to buy any material for client.</div>
                                                        </div>
                                                        <input name="remark" className="remark-input" autoComplete='false' placeholder="Enter your remark/instruction here"
                                                            value={remark} onChange={(e) => setRemark(e.target.value)} />
                                                        <div className="tnc-wrap" id="tnc-wrap" onClick={() => setTncChecked(tncChecked ? false : true)}>
                                                            <div className={tncChecked ? "tnc-check tncChecked" : 'tnc-check'}>
                                                                <SvgIcon icon="checkbox"
                                                                    style={{
                                                                        color: tncChecked ? 'rgb(159 164 184 / 55%)' : PRIMARY_COLOUR,
                                                                        backgroundColor: '#ffffff8a',
                                                                        padding: '4px',
                                                                        borderRadius: '6px',
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="tnc-text">I agree the terms & conditions</div>
                                                        </div>
                                                    </div>
                                                    <div className="book-now-footer-btn d-f-ac" style={{ paddingTop: '10px' }}>
                                                        <div className="date-submit-wrap width100 clearfix d-f-ac">
                                                            <div className="clearfix action-btn-wrap" onClick={submitBooking}>
                                                                <div className="action-btn-icon">
                                                                    <SvgIcon icon="send" />
                                                                </div>
                                                                <div className="action-btn-text">Book Now</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>}
                                    </div>
                                    }
                                </div>
                            })}
                        </div>
                    </div >
                    {/* <!-- // Order Summary Desktop--> */}
                    {
                        !isMobile && <div className="checkout-steps-summary-wrap">
                            <div className="checkout-step-wrap width100 clearfix">
                                <div className="order-summary-outer" id="order-summary-outer">
                                    <div className="step-heading width100 clearfix">
                                        <div className="stepCount">
                                            <div className="activestep">4</div>
                                        </div>
                                        <div className="step-name">Order Summary</div>
                                    </div>
                                    <div className="step-content step-content-expanded" style={{ height: orderSummaryContainerHeight }}>
                                        <div className="width100 items-outer" ref={orderSummaryContainer}>
                                            <div className="item-list-container">
                                                {cartBookingItems.map((item: any, index: number) => {
                                                    return <div className="width100 items-wrap" key={index}>
                                                        <div className="item-content">
                                                            <div className="category clearfix">
                                                                <div className="category-name d-ib">{item.categoryName}</div>
                                                                <div className="price d-ib">₹ {item.total}</div>
                                                            </div>
                                                            <div className="service">
                                                                <div className="clearfix width100">
                                                                    <div className="service-name d-ib">{item.name}</div>
                                                                </div>
                                                            </div>
                                                            {item.isAnyTypeAvailableForService && <div className="types-list">
                                                                {item.types.map((type: any, typeIndex: number) => {
                                                                    return <div className="type" key={typeIndex}>
                                                                        <div className="clearfix width100">
                                                                            <div className="service-name">{type.name}</div>
                                                                        </div>
                                                                    </div>
                                                                })}
                                                            </div>}

                                                            <div className="category clearfix">
                                                                <div className="category-name d-ib">Convenience Fee</div>
                                                                <div className="price d-ib">₹ {item.convenienceFee}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                })}
                                            </div>
                                            <div className="items-wrap width100 total-container" style={{ marginTop: '10px' }}>
                                                <div className="category clearfix">
                                                    <div className="category-name d-ib">Sub Total </div>
                                                    <div className="price d-ib">₹ {finalSubTotal.toFixed(2)}</div>
                                                </div>
                                                <div className="subtotal clearfix">
                                                    <div className="category-name d-ib">Convenience Fee </div>
                                                    <div className="price d-ib">₹ {convenienceChargesTotal.toFixed(2)}</div>
                                                </div>
                                                <div className="taxes clearfix">
                                                    <div className="category-name d-ib">Taxes({taxes[0].name} {taxes[0].value}%)</div>
                                                    <div className="price d-ib">₹ {taxes[0].total.toFixed(2)}</div>
                                                </div>
                                                <div className="total clearfix">
                                                    <div className="category-name d-ib">Total Payable Amount </div>
                                                    <div className="price d-ib">₹ {total.toFixed(2)}</div>
                                                </div>
                                            </div>
                                            <div className="items-wrap width100 final-note-wrap">
                                                <div className="note">
                                                    <div className="width100">Required material cost is excluded from the above amount.</div>
                                                    <div className="width100">Additional charges will be adjusted against the final bill, after the inspection.</div>
                                                    {isAnyEmergencyServiceAvl && <div className="width100">Convenience fee applied per service, and it will be vary on the basis of selected booking time.</div>}
                                                    {!isAnyEmergencyServiceAvl && <div className="width100">Convenience fee applied per service.</div>}
                                                    <div className="width100">Pay online after your service approval.</div>
                                                    <div className="width100">The Company is not responsible for any transaction happening between client and vendor.</div>
                                                    <div className="width100">Vendor is not authorized to buy any material for client.</div>
                                                </div>
                                                <input name="remark" className="remark-input" autoComplete='false' placeholder="Enter your remark/instruction here" value={remark} onChange={(e) => setRemark(e.target.value)} />
                                                <div className="tnc-wrap" id="tnc-wrap" onClick={() => setTncChecked(tncChecked ? false : true)}>
                                                    <div className={tncChecked ? "tnc-check tncChecked" : 'tnc-check'} >
                                                        <SvgIcon icon="checkbox" />
                                                    </div>
                                                    <div className="tnc-text">I agree the terms & conditions</div>
                                                </div>
                                            </div>
                                            <div className="book-now-footer-btn d-f-ac" style={{ paddingTop: '10px' }}>
                                                <div className="date-submit-wrap width100 clearfix d-f-ac">
                                                    <div className="clearfix action-btn-wrap" onClick={submitBooking}>
                                                        <div className="action-btn-icon">
                                                            {/* <mat-icon>send</mat-icon> */}
                                                        </div>
                                                        <div className="action-btn-text">Book Now</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                    {isRegistrationModalOpen && <UserRegistrationModal handleClose={(userData: any) => handleUserRegistrationResponse(userData)} phone={enteredPhoneNumber} />}
                    {isAddressModalOpen && <AddressModal handleClose={(e: any) => addressModalSuccess(e)} loggedInUserData={loggedInUserData} />}
                </div >
                :
                <EmptyCart showAddMoreServicesBtn={true} />
            }
        </div >
    )
}

export default CheckoutPage
