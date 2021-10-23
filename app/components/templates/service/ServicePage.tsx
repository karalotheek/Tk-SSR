import { updateBookingItems } from '@context/actions/booking';
import { updateCurationData } from '@context/actions/curation';
import { getActiveCurations } from '@services/curation';
import { emergencyServiceCheck, vibrate } from '@services/globalService';
import { getValueFromLocalStorage, setValueInLocalStorage } from '@services/webstorage';
import { windowRef } from '@services/window';
import { DetectMob } from '@util/DetectUserAgent';
import React, { FC, useState, useEffect, useRef, MutableRefObject } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { disableLoader, enableLoader } from '@context/actions';
import { useRouter } from 'next/router'
import Link from 'next/link';
import SvgIcon from '@element/svgIcon';
import ConsultationModal from '@template/modal/consultation/consultationModal';
import AddItemErrorModal from '@template/modal/addItemError/AddItemErrorModal';
import PopularCategories from '@module/popularCategories';


const ServicePage: FC<any> = ({ categories, services, category, service }) => {
    const router = useRouter();
    let cartItemsCheckingProgress = false;
    const dispatch = useDispatch();
    const [activeService, setActiveService] = useState(service);
    const [activeCategory, setActiveCategory] = useState(category);
    const curations = useSelector((state: any) => state.curations);
    const cartBookingItems = useSelector((state: any) => state.booking.items);
    const isMobileDevice = DetectMob();
    const [convenienceFee, setConvenienceFee] = useState(Number(category.convFee));
    const [isEmergencyService, setIsEmergencyService] = useState(false);
    const [isAlreadyInCart, setIsAlreadyInCart] = useState(false);
    const [isAnyTypeAvailableForService, setIsAnyTypeAvailableForService] = useState(false);
    const isAnyTypeAvailableForServiceRef: MutableRefObject<boolean> = useRef<boolean>(false);
    isAnyTypeAvailableForServiceRef.current = isAnyTypeAvailableForService;
    const [updateCart, setUpdateCart] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentServiceTypesBookingObj, setCurrentServiceTypesBookingObj] = useState<any[]>([]);
    const currentServiceTypesBookingObjRef: MutableRefObject<any[]> = useRef([]);
    currentServiceTypesBookingObjRef.current = currentServiceTypesBookingObj;
    const [removeLocalItemButInCart, setRemoveLocalItemButInCart] = useState(false);

    //css
    const [btnCSS, setbtnCSS] = useState({
        addBtnStyle: { 'left': '50%' },
        removeBtnStyle: { 'marginLeft': '-80%' },
        updateBtnStyle: { 'marginLeft': '-80%' },
        checkoutBtnStyle: { 'marginRight': '-80%' },
        totalBtnStyle: { 'paddingLeft': '0%' },
    })
    //modal
    const [consultationModal, setConsultationModal] = useState(false);
    const [addItemErrorModal, setAddItemErrorModal] = useState(false);

    useEffect(() => {
        setConvenienceFee(Number(category.convFee));
    }, [])

    useEffect(() => {
        setUpdateCart(false);
        setTotal(0);
        setIsAlreadyInCart(false);
    }, [router.asPath])

    useEffect(() => {
        setActiveService(service);
        setActiveCategory(category);
    }, [service, category])

    useEffect(() => {
        if (cartBookingItems.length) {
            cartItemsCheckingProgress = true;
            setDefaultQuantities(activeService);
        }
    }, [cartBookingItems])

    useEffect(() => {
        if (curations.availableList.length != 0 && activeService) {
            emergencyServiceCheck(curations.availableList, activeService.categoryId, activeService.key).then((res) => {
                setIsEmergencyService(res ? true : false);
            });
        } else setIsEmergencyService(false);
    }, [curations])

    useEffect(() => {
        if (service) {
            setDefaultQuantities(service);
        }
    }, [service])

    useEffect(() => {
        if (windowRef) {
            if (curations.availableList.length == 0) {
                getActiveCurations().subscribe((response: any) => {
                    const curatedGroupList = response;
                    dispatch(updateCurationData(curatedGroupList));
                })
            }
            const percistedItems = getValueFromLocalStorage('bookingItems');
            dispatch(updateBookingItems(percistedItems ? percistedItems : []));
        }
        window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }, [windowRef])

    const setDefaultQuantities = (service: any) => {
        if (service) {
            let activeServiceCopy = { ...service };
            if (activeServiceCopy.types && activeServiceCopy.types.length != 0) {
                activeServiceCopy.types = activeServiceCopy.types.filter((data: any) => data.active)
            }
            if (activeServiceCopy.types && activeServiceCopy.types.length != 0) {
                setIsAnyTypeAvailableForService(true);

                activeServiceCopy.types.map((data: any) => {
                    //set alll listing quantity as 0
                    data.quantity = 0;
                    if (data.typeList) {
                        data.typeList.map((item: any) => item.quantity = 0);
                    }
                    // check for item in cart if avl then set its qty to current
                    if (cartBookingItems && cartBookingItems.length != 0) {
                        let isServiceAlreadyInCart = cartBookingItems.filter((data: any) => data.key == activeServiceCopy.key);
                        if (isServiceAlreadyInCart.length != 0) {
                            let serviceFromCart = isServiceAlreadyInCart[0];
                            activeServiceCopy.types.map((localTypeData: any) => {
                                let cartTypeData = serviceFromCart.types.filter((data: any) => data.id == localTypeData.id);
                                if (cartTypeData.length) {
                                    localTypeData.rate = cartTypeData[0].rate;
                                    localTypeData.commonCharges = cartTypeData[0].commonCharges;
                                    localTypeData.vendorCharges = cartTypeData[0].vendorCharges;
                                    localTypeData.adminCharges = cartTypeData[0].adminCharges;
                                    localTypeData.quantity = cartTypeData[0].quantity;
                                }
                            })
                        }
                    }
                })
            } else {
                setIsAnyTypeAvailableForService(false);
                activeServiceCopy.quantity = 0;
                if (cartBookingItems && cartBookingItems.length != 0) {
                    let isServiceAlreadyInCart = cartBookingItems.filter((data: any) => data.key == activeServiceCopy.key);
                    if (isServiceAlreadyInCart.length != 0) {
                        activeServiceCopy.quantity = isServiceAlreadyInCart[0].quantity;
                    }
                }
            }
            setTimeout(() => {
                setActiveService({ ...activeServiceCopy });
                dispatch(enableLoader());
                calculateTotal(activeServiceCopy);
            });
        }
    }
    const calculateTotal = (service: any) => {
        setUpdateCart(false);
        let updateCartRef = false;
        let totalRef = 0;
        let btnCSSRef = btnCSS;
        let removeLocalItemButInCartRef = false;
        let isAlreadyInCartRef = false;
        let currentServiceTypesBookingObjCopy: any[] = [];
        //checks cart item and current activeService booking obj is same or not
        var isEqual = function (value: any, other: any) {
            // Get the value type
            var type = Object.prototype.toString.call(value);
            // If the two objects are not the same type, return false
            if (type !== Object.prototype.toString.call(other)) return false;
            // If items are not an object or array, return false
            if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;
            // Compare the length of the length of the two items
            var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
            var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
            if (valueLen !== otherLen) return false;
            // Compare two items
            var compare = function (item1: any, item2: any) {
                // Get the object type
                var itemType = Object.prototype.toString.call(item1);
                // If an object or array, compare recursively
                if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
                    if (!isEqual(item1, item2)) return false;
                }
                // Otherwise, do a simple comparison
                else {
                    // If the two items are not the same type, return false
                    if (itemType !== Object.prototype.toString.call(item2)) return false;
                    // Else if it's a function, convert to a string and compare
                    // Otherwise, just compare
                    if (itemType === '[object Function]') {
                        if (item1.toString() !== item2.toString()) return false;
                    } else {
                        if (item1 !== item2) return false;
                    }
                }
            };

            // Compare properties
            if (type === '[object Array]') {
                for (var i = 0; i < valueLen; i++) {
                    if (compare(value[i], other[i]) === false) return false;
                }
            } else {
                for (var key in value) {
                    if (value.hasOwnProperty(key)) {
                        if (compare(value[key], other[key]) === false) return false;
                    }
                }
            }
            // If nothing failed, return true
            return true;

        };
        if (isAnyTypeAvailableForServiceRef.current) {
            // this is for services has types
            service.types.map((data: any) => {
                if (data.quantity) {
                    currentServiceTypesBookingObjCopy.push(data);
                }
            })
            if (currentServiceTypesBookingObjCopy.length != 0) {
                // calculate total
                totalRef = 0;
                let totalCopy = totalRef;
                currentServiceTypesBookingObjCopy.map((data, index) => {
                    totalCopy += (data.charges * data.quantity);
                    if (index == currentServiceTypesBookingObjCopy.length - 1) {
                        totalRef = totalCopy;
                    }
                })
                // check for any change in cart booking obj
                if (cartBookingItems && cartBookingItems.length != 0 && currentServiceTypesBookingObjCopy && currentServiceTypesBookingObjCopy.length != 0) {
                    cartBookingItems.map((cartItem: any) => {
                        if (cartItem.key == service.key) {
                            if (!(isEqual(cartItem.types, currentServiceTypesBookingObjCopy))) {
                                updateCartRef = true;
                            }
                        }
                    })
                } else updateCartRef = false;

            } else totalRef = 0;

            // when cart contains current service but we remove all items from currentbookingobj then set update cart true
            if (cartBookingItems && cartBookingItems.length != 0) {
                let isServiceAlreadyInCart = cartBookingItems.filter((data: any) => data.key == service.key);
                if (isServiceAlreadyInCart.length != 0 && currentServiceTypesBookingObjCopy.length == 0) removeLocalItemButInCartRef = true;
                else removeLocalItemButInCartRef = false;
            }
            if (updateCartRef || removeLocalItemButInCartRef) {
                //if any change is detect in case of cart booking obj then show update cart button
                btnCSSRef = {
                    ...btnCSSRef,
                    addBtnStyle: { 'left': '-100%' },
                    removeBtnStyle: { 'marginLeft': '-80%' },
                    updateBtnStyle: { 'marginLeft': '0%' },
                    checkoutBtnStyle: { 'marginRight': '0%' }
                };
            } else {
                if (cartBookingItems && cartBookingItems.length != 0) {
                    let isServiceAlreadyInCart = cartBookingItems.filter((data: any) => data.key == service.key);
                    if (isServiceAlreadyInCart.length != 0) {
                        btnCSSRef = {
                            ...btnCSSRef,
                            addBtnStyle: { 'left': '-100%' },
                            removeBtnStyle: { 'marginLeft': '0%' },
                            updateBtnStyle: { 'marginLeft': '-80%' },
                            checkoutBtnStyle: { 'marginRight': '0%' },
                        };
                    }
                }
            }
        } else {
            // this is for direct service means service has no types
            if (service.quantity) {
                totalRef = (service.charges * service.quantity);
            }
            if (cartBookingItems && cartBookingItems.length != 0) {
                let isServiceAlreadyInCart = cartBookingItems.filter((data: any) => data.key == service.key);
                if (isServiceAlreadyInCart.length != 0) {
                    if (isServiceAlreadyInCart[0].key == service.key) {
                        if (isServiceAlreadyInCart[0].quantity != service.quantity) {
                            updateCartRef = true;
                            btnCSSRef = {
                                ...btnCSSRef,
                                addBtnStyle: { 'left': '-100%' },
                                removeBtnStyle: { 'marginLeft': '-80%' },
                                updateBtnStyle: { 'marginLeft': '0%' },
                                checkoutBtnStyle: { 'marginRight': '0%' },
                            };
                        } else {
                            btnCSSRef = {
                                ...btnCSSRef,
                                addBtnStyle: { 'left': '-100%' },
                                removeBtnStyle: { 'marginLeft': '0%' },
                                updateBtnStyle: { 'marginLeft': '-80%' },
                                checkoutBtnStyle: { 'marginRight': '0%' },
                            };
                        }
                    }
                }
            }
        }
        dispatch(disableLoader());
        // setTimeout(() => {
        setCurrentServiceTypesBookingObj(currentServiceTypesBookingObjCopy);
        setUpdateCart(updateCartRef);
        setTotal(totalRef);
        checkServiceInCart(btnCSSRef);
        setbtnCSS(btnCSSRef);
        setRemoveLocalItemButInCart(removeLocalItemButInCartRef);
        // });
    }

    const checkServiceInCart = (btnCSSRef: any) => {
        if (service && cartItemsCheckingProgress) {
            cartItemsCheckingProgress = false;
            let isAlreadyInCart = [];

            if (cartBookingItems && cartBookingItems.length != 0) {
                isAlreadyInCart = cartBookingItems.filter((data: any) => data.key == service.key);
                if (isAlreadyInCart && isAlreadyInCart.length != 0) {
                    setIsAlreadyInCart(true);
                    btnCSSRef = {
                        ...btnCSSRef,
                        addBtnStyle: { 'left': '-100%' },
                        removeBtnStyle: { 'marginLeft': '0%' },
                        checkoutBtnStyle: { 'marginRight': '0%' },
                    };

                    !isMobileDevice && (btnCSSRef.totalBtnStyle = { 'paddingLeft': '11%' })
                }
            }
            if (isAlreadyInCart.length == 0) {

                setIsAlreadyInCart(false);
                btnCSSRef = {
                    ...btnCSSRef,
                    addBtnStyle: { 'left': '50%' },
                    totalBtnStyle: { 'paddingLeft': '0%' },
                    removeBtnStyle: { 'marginLeft': '-80%' },
                    checkoutBtnStyle: { 'marginRight': '-80%' },
                };
            }
            setbtnCSS({ ...btnCSSRef });
        }
    }

    const addItemToBookingItems = () => {
        let btnCSSRef = btnCSS;
        btnCSSRef = {
            ...btnCSSRef,
            addBtnStyle: { 'left': '-100%' },
            removeBtnStyle: { 'marginLeft': '0%' },
            checkoutBtnStyle: { 'marginRight': '0%' },
        };
        !isMobileDevice && (btnCSSRef.totalBtnStyle = { 'paddingLeft': '11%' })
        var serviceData = { ...activeService };
        if (isAnyTypeAvailableForServiceRef.current) {
            currentServiceTypesBookingObjRef.current.map((typeData) => {
                // typeData.activeChargesType = '';
                typeData.rate = 0;
                typeData.commonCharges = typeData.charges;
                typeData.vendorCharges = 0;
                typeData.adminCharges = 0;
                if (typeData.commonCharges) typeData.rate = parseFloat(typeData.commonCharges);
                else typeData.rate = parseFloat(typeData.vendorCharges) + parseFloat(typeData.adminCharges);
            })
        }
        let item = {
            name: serviceData.name,
            key: activeService.key,
            categoryId: activeCategory.key,
            categoryName: activeCategory.name,
            convenienceFee: convenienceFee,
            categorySamallImg: activeCategory.smallImg,
            categoryCharges: activeCategory.charges,
            types: currentServiceTypesBookingObjRef.current,
            total: total,
            assignedVendors: [],
            equipments: [],
            commonCharges: serviceData.charges || 0,
            activeChargesType: '',
            rate: parseFloat(serviceData.charges || 0),
            quantity: serviceData.quantity || 0,
            vendorCharges: 0,
            adminCharges: 0,
            files: [],
            isEmgSer: isEmergencyService,
            isAnyTypeAvailableForService: isAnyTypeAvailableForService
        }
        setbtnCSS({ ...btnCSSRef })
        addOrderItemToCart(item);
        vibrate();
    }
    const addToCart = () => {
        let btnCSSRef = btnCSS;
        if (cartBookingItems && cartBookingItems.length != 0) {
            let avlCategories: any[] = [];
            cartBookingItems.map((data: any) => {
                if (!(avlCategories.includes(data.categoryId))) avlCategories.push(data.categoryId);
            });
            if (avlCategories.length == 3) {
                if (!(avlCategories.includes(activeCategory.key))) {
                    setAddItemErrorModal(true);
                    btnCSSRef = {
                        ...btnCSSRef,
                        addBtnStyle: { 'left': '-100%' },
                    };
                    !isMobileDevice && (btnCSSRef.totalBtnStyle = { 'paddingLeft': '11%' })
                    setbtnCSS({ ...btnCSSRef });
                    return;
                } else addItemToBookingItems();
            } else addItemToBookingItems();
        } else addItemToBookingItems();
    }
    const updateToCart = () => {
        // for cart obj
        let btnCSSRef = btnCSS;
        cartBookingItems.map((data: any, i: number) => {
            if (data.key == activeService.key) {
                // if any item selected 
                // if service has type
                if (isAnyTypeAvailableForServiceRef.current) {
                    if (currentServiceTypesBookingObjRef.current.length != 0) {
                        let currentServiceTypesBookingObjCopy = [...currentServiceTypesBookingObjRef.current];
                        currentServiceTypesBookingObjCopy.map((typeData, index) => {
                            typeData.rate = 0;
                            typeData.commonCharges = typeData.charges;
                            typeData.vendorCharges = 0;
                            typeData.adminCharges = 0;
                            if (typeData.commonCharges) typeData.rate = parseFloat(typeData.commonCharges);
                            else typeData.rate = parseFloat(typeData.vendorCharges) + parseFloat(typeData.adminCharges);
                            if (index == currentServiceTypesBookingObjCopy.length - 1) setCurrentServiceTypesBookingObj([...currentServiceTypesBookingObjCopy]);
                        })
                        data.types = currentServiceTypesBookingObj;
                        replaceBookingItems(data);
                        btnCSSRef = {
                            ...btnCSSRef,
                            addBtnStyle: { 'left': '-100%' },
                            removeBtnStyle: { 'marginLeft': '0%' },
                            updateBtnStyle: { 'marginLeft': '-80%' },
                            checkoutBtnStyle: { 'marginRight': '0%' },
                        };
                    } else {
                        btnCSSRef = {
                            ...btnCSSRef,
                            addBtnStyle: { 'left': '50%' },
                            removeBtnStyle: { 'marginLeft': '-80%' },
                            updateBtnStyle: { 'marginLeft': '-80%' },
                            checkoutBtnStyle: { 'marginRight': '-80%' },
                            totalBtnStyle: { 'paddingLeft': '0%' }
                        };
                        removeOrderItemToCart(activeService.key);
                    }
                } else {
                    data.quantity = activeService.quantity;
                    removeOrderItemToCart(activeService.key);
                    if (activeService.quantity) {
                        btnCSSRef = {
                            ...btnCSSRef,
                            addBtnStyle: { 'left': '-100%' },
                            removeBtnStyle: { 'marginLeft': '0%' },
                            updateBtnStyle: { 'marginLeft': '-80%' },
                            checkoutBtnStyle: { 'marginRight': '0%' },
                        };
                        addOrderItemToCart(data);
                    } else {
                        btnCSSRef = {
                            ...btnCSSRef,
                            addBtnStyle: { 'left': '50%' },
                            removeBtnStyle: { 'marginLeft': '-80%' },
                            updateBtnStyle: { 'marginLeft': '-80%' },
                            checkoutBtnStyle: { 'marginRight': '-80%' },
                            totalBtnStyle: { 'paddingLeft': '0%' }
                        };
                    }
                }
            }
        })
        vibrate();
        setbtnCSS({ ...btnCSSRef });
        setUpdateCart(false);
    }
    const removeFromCart = () => {
        let btnCSSRef = btnCSS;
        btnCSSRef = {
            ...btnCSSRef,
            addBtnStyle: { 'left': '50%' },
            removeBtnStyle: { 'marginLeft': '-80%' },
            checkoutBtnStyle: { 'marginRight': '-80%' },
            totalBtnStyle: { 'paddingLeft': '0%' }
        };

        removeOrderItemToCart(activeService.key);
        let activeServiceCopy = { ...activeService };
        if (isAnyTypeAvailableForServiceRef.current) {
            activeServiceCopy.types.map((data: any) => {
                data.quantity = 0;
            })
        } else {
            activeServiceCopy.quantity = 0;
        }
        setActiveService({ ...activeServiceCopy });
        setUpdateCart(false);
        setbtnCSS({ ...btnCSSRef });
        setCurrentServiceTypesBookingObj([]);
        vibrate();
    }
    const checkout = () => {
        router.push('cart');
    }

    const addToBucket = (typeDetails: any, status: string) => {
        let activeServiceCopy = { ...activeService };
        if (status == 'from-type') {
            activeServiceCopy.types.map((data: any) => {
                if (data.id == typeDetails.id) data.quantity = 1;
            })
        } else if (status == 'from-service') {
            activeServiceCopy.quantity = 1;
        }
        setActiveService({ ...activeServiceCopy });
        calculateTotal(activeServiceCopy);
        vibrate();
    }
    const addQuantityToBucket = (typeDetails: any, status: string) => {
        let activeServiceCopy = { ...activeService };
        if (status == 'from-type') {
            activeServiceCopy.types.map((data: any) => {
                if (data.id == typeDetails.id) data.quantity += 1;
            })
        } else if (status == 'from-service') {
            activeServiceCopy.quantity += 1;
        }
        setActiveService({ ...activeServiceCopy });
        calculateTotal(activeServiceCopy);
        vibrate();
    }
    const removeQuantityFromBucket = (typeDetails: any, status: string) => {
        let activeServiceCopy = { ...activeService };
        if (status == 'from-type') {
            activeServiceCopy.types.map((data: any) => {
                if (data.id == typeDetails.id) data.quantity -= 1;
            })
        } else if (status == 'from-service') {
            activeServiceCopy.quantity -= 1;
        }
        setActiveService({ ...activeServiceCopy });
        calculateTotal(activeServiceCopy);
        vibrate();
    }

    const addOrderItemToCart = (data: any) => {
        let cartBookingItemsCopy = cartBookingItems;
        let index = cartBookingItemsCopy.findIndex((cartItem: any) => cartItem.key === data.key);
        if (index != -1) {
            replaceBookingItems(data);
            return;
        }
        cartBookingItemsCopy.push(data);
        setValueInLocalStorage("bookingItems", cartBookingItemsCopy);
        dispatch(updateBookingItems(cartBookingItemsCopy));
    }

    const removeOrderItemToCart = (key: any) => {
        let cartBookingItemsCopy = cartBookingItems;
        cartBookingItemsCopy = [...(cartBookingItemsCopy.filter((data: any) => data.key != key))];
        setValueInLocalStorage("bookingItems", cartBookingItemsCopy);
        dispatch(updateBookingItems(cartBookingItemsCopy));
    }

    const replaceBookingItems = (data: any) => {
        let cartBookingItemsCopy = cartBookingItems;
        let index = cartBookingItemsCopy.findIndex((cartItem: any) => cartItem.key === data.key);
        cartBookingItemsCopy.splice(index, 1, data);
        setValueInLocalStorage("bookingItems", cartBookingItemsCopy);
        dispatch(updateBookingItems(cartBookingItemsCopy));
    }

    const openConsultationModal = () => {
        console.log('')
    }

    const closeCartMsgModal = () => {

        let btnCSSRef = btnCSS;
        btnCSSRef = {
            ...btnCSSRef,
            addBtnStyle: { 'left': '50%' },
            totalBtnStyle: { 'paddingLeft': '0%' }
        };
        setbtnCSS(btnCSSRef);
        setAddItemErrorModal(false);
    }

    return (
        <div className="service-page-wrapper">
            {activeService && activeCategory ?
                <div className="container">
                    <h2 className="cat-name primary-heading">{activeCategory.name}</h2>
                    <div className="flex-container">
                        <div className="leftContent">
                            <div className="service-heading">Book a <span>{activeService.name}</span> Service Today.</div>
                            {/* {total} == {updateCart} == {isAlreadyInCart} == {removeLocalItemButInCart} */}
                            {isAnyTypeAvailableForService && <p className="service-desc">{activeService.description}</p>}
                            {/* <!-- // for direct service service has no type desktop--> */}
                            {!isAnyTypeAvailableForService && <div className="typeless-service-container desktop clearfix">
                                <p className="service-desc" style={{ paddingRight: '20px' }}>{activeService.description}</p>
                                <div className="types-list" style={{ marginBottom: '40px' }}>
                                    <div className="service-item">
                                        <div className="type clearfix ">
                                            <div className="details">
                                                <div className="name">{activeService.name}</div>
                                            </div>
                                            <div className="pricing-container">
                                                <div className="price">₹ {activeService.charges} &nbsp;{activeService.chargesType}</div>
                                            </div>
                                            {activeService.isBA && <div className="quantity-btn">
                                                {!activeService.showQty && <div className="width100">
                                                    {(!activeService.quantity || activeService.quantity == 0) && <div className="add-btn"
                                                        onClick={() => addToBucket(activeService, 'from-service')}>
                                                        Select
                                                    </div>}
                                                    {activeService.quantity != 0 && <div className="add-btn added-to-cart"
                                                        onClick={() => removeQuantityFromBucket(activeService, 'from-service')}>
                                                        Selected
                                                    </div>}
                                                </div>}
                                                {activeService.showQty && <div className="plus-minus-btn clearfix">
                                                    {(!activeService.quantity || activeService.quantity == 0) && <div className="add-btn"
                                                        onClick={() => addToBucket(activeService, 'from-service')}>
                                                        Select
                                                    </div>}
                                                    {activeService.quantity != 0 && <div>
                                                        <div className="minus-qty" onClick={() => removeQuantityFromBucket(activeService, 'from-service')}></div>
                                                        <div className="quantity">{activeService.quantity}</div>
                                                        <div className="add-qty" onClick={() => addQuantityToBucket(activeService, 'from-service')}>+</div>
                                                    </div>}
                                                </div>}
                                            </div>}
                                        </div>
                                    </div>
                                </div>
                            </div>}
                        </div>
                        {
                            activeService.consultation && <div className="floating-consultation desktop" onClick={() => setConsultationModal(true)}>
                                <div className="icon">
                                    {/* <mat-icon>assignment</mat-icon> */}
                                </div>
                                <div className="text">Book A <br />consultation</div>
                            </div>
                        }
                    </div>

                    {/* <!-- // for direct service service has no type mobile--> */}
                    {!isAnyTypeAvailableForService && <div className="price-container mobile clearfix">
                        <p className="service-desc">{activeService.description}</p>
                        <div className="types-list" style={{ marginBottom: '40px' }}>
                            <div className="service-item">
                                <div className="type clearfix ">
                                    <div className="details">
                                        <div className="name">{activeService.name}</div>
                                    </div>
                                    <div className="pricing-container">
                                        <div className="price">₹ {activeService.charges} &nbsp;{activeService.chargesType}</div>
                                    </div>
                                    {activeService.isBA && <div className="quantity-btn">
                                        {!activeService.showQty && <div>
                                            {(!activeService.quantity || activeService.quantity == 0) && <div className="add-btn"
                                                onClick={() => addToBucket(activeService, 'from-service')}>
                                                Select
                                            </div>}
                                            {activeService.quantity != 0 && <div className="add-btn added-to-cart"
                                                onClick={() => removeQuantityFromBucket(activeService, 'from-service')}>
                                                Selected
                                            </div>}
                                        </div>}

                                        {activeService.showQty && <div className="plus-minus-btn clearfix">
                                            {(!activeService.quantity || activeService.quantity == 0) && <div className="add-btn"
                                                onClick={() => addToBucket(activeService, 'from-service')}>
                                                Select
                                            </div>}
                                            {activeService.showQty && <div>
                                                <div className="minus-qty"
                                                    onClick={() => removeQuantityFromBucket(activeService, 'from-service')}>-</div>
                                                <div className="quantity">{activeService.quantity}</div>
                                                <div className="add-qty"
                                                    onClick={() => addQuantityToBucket(activeService, 'from-service')}>+</div>
                                            </div>}
                                        </div>}

                                    </div>}
                                </div>
                            </div>
                        </div>
                    </div>}

                    {/* <!-- // for services has type --> */}
                    {isAnyTypeAvailableForService && <div className="price-container">
                        {activeService.consultation && <div className="consultaion mobile" onClick={() => setConsultationModal(true)}>Book a consultation</div>}
                        <div className="types-list" style={{ marginBottom: '40px' }}>
                            {activeService?.types?.map((type: any, index: number) => {
                                return <div key={index} className="type-item-wrap">
                                    <div className="type clearfix">
                                        <div className="details">
                                            <div className="name">{type.name}</div>
                                        </div>
                                        <div className="pricing-container">
                                            <div className="price">₹ {type.charges} &nbsp;{type.chargesType}</div>
                                        </div>
                                        {type.isBA && activeService.isBA && <div className="quantity-btn">
                                            {(!activeService.showQty || !type.showQty) && <div>
                                                {!type.quantity && <div className="add-btn" onClick={() => addToBucket(type, 'from-type')}>
                                                    Select
                                                </div>}
                                                {type.quantity != 0 && <div className="add-btn added-to-cart"
                                                    onClick={() => removeQuantityFromBucket(type, 'from-type')}>
                                                    Selected
                                                </div>}
                                            </div>}
                                            {activeService.showQty && type.showQty && <div className="plus-minus-btn clearfix">
                                                {!type.quantity && <div className="add-btn" onClick={() => addToBucket(type, 'from-type')}>
                                                    Select
                                                </div>}
                                                {type.quantity && <div>
                                                    <div className="minus-qty" onClick={() => removeQuantityFromBucket(type, 'from-type')}></div>
                                                    <div className="quantity">{type.quantity}</div>
                                                    <div className="add-qty" onClick={() => addQuantityToBucket(type, 'from-type')}></div>
                                                </div>}
                                            </div>}
                                        </div>}
                                    </div>
                                </div>
                            })}
                        </div>
                    </div>}

                    {((total !== 0 || isAlreadyInCart) || (removeLocalItemButInCart || updateCart || isAlreadyInCart)) && <div className="addto-cart-container sticky clearfix animate__animated animate__zoomIn animate__faster">
                        <div className="note-container desktop">
                            <div className="note">Inspection charges will be adjusted against the final bill.</div>
                            {convenienceFee && !isEmergencyService && <div className="note">Convenience fee Rs {convenienceFee}.</div>}
                            {convenienceFee && isEmergencyService && <div className="note">Convenience fee Rs {convenienceFee}. (Depends on booking time)</div>}
                            <div className="note">Charges excludes material costs, masonry charge.</div>
                        </div>
                        <div className="cart-button">
                            <div className="btn-wrapper clearfix d-f-ac">
                                <div className="clearfix action-btn-outer add" style={{ ...btnCSS.addBtnStyle, padding: '0', transform: 'translateX(-50%)' }}>
                                    <div className="clearfix action-btn-wrap" onClick={addToCart}>
                                        <div className="action-btn-icon">
                                            <SvgIcon icon="addToCart" alt="" />
                                        </div>
                                        <div className="action-btn-text">Add To Cart</div>
                                    </div>
                                </div>
                                <div className="clearfix action-btn-outer remove" style={{ ...btnCSS.removeBtnStyle, padding: '0' }}>
                                    <div className="clearfix action-btn-wrap" onClick={removeFromCart}>
                                        <div className="action-btn-icon">
                                            <SvgIcon icon="removeFromCart" alt="" />
                                        </div>
                                        <div className="action-btn-text">Remove</div>
                                    </div>
                                </div>
                                <div className="clearfix action-btn-outer update" style={{ ...btnCSS.updateBtnStyle, padding: '0' }}>
                                    <div className="clearfix action-btn-wrap" onClick={updateToCart}>
                                        <div className="action-btn-icon">
                                            <SvgIcon icon="addToCart" alt="" />
                                        </div>
                                        <div className="action-btn-text">Update</div>
                                    </div>
                                </div>
                                <div className="clearfix action-btn-outer checkout" style={{ ...btnCSS.checkoutBtnStyle, padding: '0' }}>
                                    <div className="clearfix action-btn-wrap" onClick={checkout}>
                                        <div className="action-btn-icon">
                                            <SvgIcon icon="cart" alt="" />
                                        </div>
                                        <div className="action-btn-text">Go to Cart</div>
                                    </div>
                                </div>
                            </div>
                            <div className="total">Subtotal : Rs.{total} + On Inspection</div>
                        </div>
                        <div className="note-container mobile animate__animated animate__zoomIn animate__faster">
                            <div className="note">Inspection charges will be adjusted against the final bill.</div>
                            {convenienceFee && !isEmergencyService && <div className="note">Convenience fee Rs {convenienceFee}.</div>}
                            {convenienceFee && isEmergencyService && <div className="note"> Convenience fee Rs {convenienceFee}.(Depends on booking time)</div>}
                            <div className="note">Charges excludes material costs, masonry charge.</div>
                        </div>
                    </div>}

                    <h3 className="m-t-30 primary-heading heading-bottom-border">Related Services</h3>
                    <div className="M-flex-container m-t-30">
                        {services.map((service: any, index: number) => {
                            return <Link href={service.url} key={index} shallow={true}>
                                <div className="home-card">
                                    <h5 className="service-name">{service.name}</h5>
                                    <div className="book-btn-wrap">
                                        <button className="btn book-btn">Book Now</button>
                                    </div>
                                </div>
                            </Link>
                        })}
                    </div>

                    <PopularCategories categories={categories} config={{ showTitle: true }} />

                    {consultationModal && <ConsultationModal activeService={activeService} handleClose={() => setConsultationModal(false)} />}
                    {addItemErrorModal && <AddItemErrorModal activeService={activeService} handleClose={() => closeCartMsgModal()} />}

                </div> : null
            }
        </div>
    )
}

export default ServicePage
