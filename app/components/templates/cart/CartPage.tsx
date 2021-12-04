import { DetectMob } from '@util/DetectUserAgent';
import React, { FC, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import SvgIcon from '@element/svgIcon';
import { getValueFromLocalStorage, setValueInLocalStorage } from '@services/webstorage';
import { updateBookingItems } from '@context/actions/booking';
import { vibrate } from '@services/globalService';
import { windowRef } from '@services/window';
import PopularCategories from '@module/popularCategories';
import EmptyCart from '@module/emptyCart/EmptyCart';
import FileUploader from '@element/fileUploader';
import RemoveItemCartModal from '@template/modal/removeItemCart/removeItemCartModal';

const CartPage: FC<any> = ({ categories }) => {

    const dispatch = useDispatch();
    const cartBookingItems: any[] = useSelector((state: any) => state.booking.items);
    const [showAddMoreServicesBtn, setShowAddMoreServicesBtn] = useState(true);
    const [finalSubTotal, setFinalSubTotal] = useState(0);
    const [convenienceChargesTotal, setConvenienceChargesTotal] = useState(0);
    const [taxes, setTaxes] = useState([{ name: 'GST', value: 18, total: 0 }]);
    const [total, setTotal] = useState(0);
    const [isAnyEmergencyServiceAvl, setIsAnyEmergencyServiceAvl] = useState(false)
    const [serviceToRemove, setServiceToRemove] = useState<any>({});
    const [itemRemoveConfirmationModal, setItemRemoveConfirmationModal] = useState(false);

    useEffect(() => {
        if (cartBookingItems.length != 0) {
            let avlCategories: any[] = [];
            cartBookingItems && cartBookingItems.map((data) => {
                if (!(avlCategories.includes(data.categoryId))) avlCategories.push(data.categoryId);
            });

            if (avlCategories.length != 3) setShowAddMoreServicesBtn(true);
            else setShowAddMoreServicesBtn(false);
            let isAnyEmergencyServiceAvl = cartBookingItems.filter((bookingItemData) => bookingItemData.isEmgSer);
            setIsAnyEmergencyServiceAvl(isAnyEmergencyServiceAvl.length != 0);
            calculateTotal();
        }
    }, [cartBookingItems])

    useEffect(() => {
        if (windowRef) {
            const percistedItems = getValueFromLocalStorage('bookingItems');
            dispatch(updateBookingItems(percistedItems ? percistedItems : []));
        }
        window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }, [windowRef])

    const replaceBookingItems = (data: any) => {
        let cartBookingItemsCopy = [...data];
        setValueInLocalStorage("bookingItems", cartBookingItemsCopy);
        dispatch(updateBookingItems(cartBookingItemsCopy));
    }

    const calculateTotal = () => {
        let finalSubTotalCopy = 0;
        let totalCopy = 0;
        let convenienceChargesTotalCopy = 0;
        let taxesCopy = [{ name: 'GST', value: 18, total: 0 }];
        let cartBookingItemsCopy = [...cartBookingItems];
        cartBookingItemsCopy.map((bookingItem, index: number) => {
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
            convenienceChargesTotalCopy += Number(bookingItem.convenienceFee);
            totalCopy = Number((finalSubTotal + taxesCopy[0].total + convenienceChargesTotalCopy).toFixed(2));
            if (index == cartBookingItems.length - 1) {
                setTotal(totalCopy);
                setFinalSubTotal(finalSubTotalCopy);
                setConvenienceChargesTotal(convenienceChargesTotalCopy);
                setTaxes(taxesCopy);
                if (total != totalCopy) {
                    replaceBookingItems(cartBookingItemsCopy);
                }
            }
        })
    }

    const closeItemRemovePopup = (status: boolean) => {
        if (status) {
            let cartBookingItemsCopy = [...cartBookingItems];
            if ('typeIndex' in serviceToRemove) {
                if (serviceToRemove.removeService) {
                    cartBookingItemsCopy.splice(serviceToRemove.serviceIndex, 1);
                    // removeOrderItemToCart(serviceToRemove.serviceKey);
                } else {
                    cartBookingItemsCopy[serviceToRemove.serviceIndex].types.splice(serviceToRemove.typeIndex, 1);
                    // replaceBookingItems(cartBookingItemsCopy);
                }
            } else {
                cartBookingItemsCopy.splice(serviceToRemove.serviceIndex, 1);
                // removeOrderItemToCart(serviceToRemove.serviceKey);
            }
            setValueInLocalStorage("bookingItems", cartBookingItemsCopy);
            dispatch(updateBookingItems(cartBookingItemsCopy));
        }
        setServiceToRemove({});
        setItemRemoveConfirmationModal(false);
    }

    const minusQuantity = (serviceIndex: any, typeIndex: any, service: any, type: any, from: any) => {
        let cartBookingItemsCopy = [...cartBookingItems];
        if (from == 'from-service') {
            if (cartBookingItemsCopy[serviceIndex].quantity - 1 == 0) {
                // show item remove popup
                let serviceToRemoveObj = {
                    serviceIndex: serviceIndex,
                    serviceKey: service.key,
                    name: service.name
                };
                setServiceToRemove(serviceToRemoveObj);
                setItemRemoveConfirmationModal(true);
            } else {
                cartBookingItemsCopy[serviceIndex].quantity -= 1;
                replaceBookingItems(cartBookingItems);
            }
        } else if (from == 'from-type') {
            if (cartBookingItemsCopy[serviceIndex].types[typeIndex].quantity - 1 == 0) {
                // show item remove popup
                let serviceToRemoveObj = {
                    serviceIndex: serviceIndex,
                    typeIndex: typeIndex,
                    serviceKey: service.key,
                    name: type.name,
                    removeService: cartBookingItemsCopy[serviceIndex].types.length == 1 ? true : false
                };
                setServiceToRemove(serviceToRemoveObj);
                setItemRemoveConfirmationModal(true);
            } else {
                cartBookingItemsCopy[serviceIndex].types[typeIndex].quantity -= 1;
                replaceBookingItems(cartBookingItemsCopy);
            }
        }
        vibrate();
    }
    const addQuantity = (serviceIndex: any, typeIndex: any, service: any, type: any, from: any) => {
        let cartBookingItemsCopy = [...cartBookingItems];
        if (from == 'from-service') {
            cartBookingItemsCopy[serviceIndex].quantity += 1;
            replaceBookingItems(cartBookingItemsCopy);
        } else if (from == 'from-type') {
            cartBookingItemsCopy[serviceIndex].types[typeIndex].quantity += 1;
            replaceBookingItems(cartBookingItemsCopy);
        }
        vibrate();
    }

    const removeItem = (serviceIndex: any, service: any) => {
        let serviceToRemoveObj = {
            serviceIndex: serviceIndex,
            serviceKey: service.key,
            name: service.name
        };
        setServiceToRemove(serviceToRemoveObj);
        setItemRemoveConfirmationModal(true);
        vibrate();
    }

    const onSelectImage = (pictureFiles: any, pictureBase64URL: any, serviceIndex: any) => {
        // console.log("pictureFiles state", pictureFiles);
        // console.log("pictureBase64URL state", pictureBase64URL);
        // console.log("state state", serviceIndex);
        if (pictureBase64URL.length) {
            let cartBookingItemsCopy = [...cartBookingItems];
            cartBookingItemsCopy[serviceIndex].files.push({ fileName: pictureFiles[0].name, base64Url: pictureBase64URL[0] });
            replaceBookingItems(cartBookingItemsCopy);
        }
    }

    const removeFile = (serviceIndex: number, fileIndex: number) => {
        let cartBookingItemsCopy = [...cartBookingItems];
        cartBookingItemsCopy[serviceIndex].files.splice(fileIndex, 1);
        replaceBookingItems(cartBookingItemsCopy);
        vibrate();
    }

    const proceedForCheckout = () => {
        // if (this.bookingItems && this.bookingItems.length != 0) {
        //     this.isLoading = true;
        //     this.createUploadableImgUrl();
        //     var imgUrlInterval = setInterval(() => {
        //         if (this.uploadableImgUrlCreation) {
        //             clearInterval(imgUrlInterval);
        //             this.webstorageService.setValueInLocalStorage('bookingImg', this.uploadableImgArray.length ? this.uploadableImgArray : []);
        //             this.globalService.setActiveNav('checkout');
        //         }
        //     })
        // }
    }

    return (
        <div className="cart-page-wrap">
            <div className="container">

                {cartBookingItems.length != 0 ? <div className="flex-container">
                    <div className="leftContent">
                        <h2 className="primary-heading heading-bottom-border m-z">Cart Contains</h2>
                        <ul className="item-list">


                            <div id="myForm">
                                <div className="width100">
                                    {cartBookingItems.length != 0 && cartBookingItems.map((item: any, itemIndex: number) => {
                                        return <li className="item-content" key={itemIndex}>
                                            <div className="category clearfix">
                                                <div className="name">
                                                    {item.categoryName}</div>
                                                <span className="price">₹ {item.total}</span>
                                            </div>
                                            <div className="service clearfix width100">
                                                {item.isAnyTypeAvailableForService && <div className="width100 clearfix">
                                                    <div className="name">
                                                        {item.name}
                                                    </div>
                                                </div>}
                                                {!item.isAnyTypeAvailableForService && <div className="width100 clearfix m-t10 m-b10 ">
                                                    <div className="width60 f-l">
                                                        <div className="name">
                                                            {item.name}
                                                        </div>
                                                        <div className="price width30 f-r">
                                                            ₹ {item.rate}
                                                        </div>
                                                    </div>
                                                    <div className="width40 clearfix p-t10">
                                                        <div className="minus-qty-wrap" onClick={() => addQuantity(itemIndex, null, item, null, 'from-service')}>
                                                            <div className="add-qty d-f-ac">
                                                                <SvgIcon icon="add" />
                                                            </div>
                                                        </div>
                                                        <div className="quantity">{item.quantity}</div>
                                                        <div className="add-qty-wrap" onClick={() => minusQuantity(itemIndex, null, item, null, 'from-service')}>
                                                            <div className="minus-qty d-f-ac">
                                                                <SvgIcon icon="remove" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>}
                                            </div>
                                            {item.isAnyTypeAvailableForService && <div className="types-list">
                                                {item.types && item.types.map((type: any, typeIndex: number) => {
                                                    return <div className="service" key={typeIndex}>
                                                        <div className="width100 clearfix m-t10 m-b10 type-wrap">
                                                            <div className="width60 f-l">
                                                                <div className="name">
                                                                    {type.name}
                                                                </div>
                                                                <div className="price width30 f-r">
                                                                    ₹ {type.rate}
                                                                </div>
                                                            </div>
                                                            <div className="width40 clearfix p-t10">
                                                                <div className="minus-qty-wrap" onClick={() => addQuantity(itemIndex, typeIndex, item, type, 'from-type')}>
                                                                    <div className="add-qty d-f-ac">
                                                                        <SvgIcon icon="add" />
                                                                    </div>
                                                                </div>
                                                                <div className="quantity">{type.quantity}</div>
                                                                <div className="add-qty-wrap" onClick={() => minusQuantity(itemIndex, typeIndex, item, type, 'from-type')}>
                                                                    <div className="minus-qty d-f-ac">
                                                                        <SvgIcon icon="remove" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                })}
                                            </div>}
                                            <div className="tax-conv-charges-wrap width100">
                                                <div className="charges-type width100">
                                                    <div className="charge-name width70">Tax {taxes[0].name}
                                                        {taxes[0].value}%</div>
                                                    <div className="charge-value width30">₹ {item.tax}</div>
                                                </div>
                                                <div className="charges-type width100">
                                                    <div className="charge-name width70">Convenience Fee</div>
                                                    <div className="charge-value width30">₹ {item.convenienceFee}</div>
                                                </div>
                                            </div>
                                            {item.files.length != 0 &&
                                                item.files.map((fileData: any, fileIndex: number) => {
                                                    return <div className="uploaded-file-wrap clearfix" key={fileIndex}>
                                                        <div className="file-name">{fileData.fileName}</div>
                                                        <div className="remove-file" onClick={() => removeFile(itemIndex, fileIndex)}><SvgIcon icon="close" color="#001871" fontSize={25} /></div>
                                                    </div>
                                                })

                                            }
                                            <div className="clearfix action-btn-outer remove-btn-wrap">
                                                <FileUploader
                                                    accept="video/*,image/*"
                                                    withLabel={false}
                                                    withIcon={false}
                                                    singleImage={true}
                                                    buttonText="Attach Files"
                                                    onChange={(e: any, base64: any) => onSelectImage(e, base64, itemIndex)}
                                                    imgExtension={[".jpg", ".gif", ".png", ".gif", ".mp4"]}
                                                    maxFileSize={5242880}
                                                />
                                                <div className="clearfix action-btn-wrap" onClick={() => removeItem(itemIndex, item)}>
                                                    <div className="action-btn-icon">
                                                        <SvgIcon icon="delete" />
                                                    </div>
                                                    <div className="action-btn-text">Remove</div>
                                                </div>
                                            </div>
                                        </li>

                                    })}
                                </div>
                            </div>

                            {DetectMob() && <>
                                {showAddMoreServicesBtn && <div className="width100" style={{ marginBottom: '30px' }}>
                                    <Link href="categories" shallow={true}>
                                        <div className="clearfix action-btn-outer d-f-ac">
                                            <div className="clearfix action-btn-wrap">
                                                <div className="action-btn-icon">
                                                    <SvgIcon icon="home" />
                                                </div>
                                                <div className="action-btn-text">Add more services</div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>}

                            </>}
                        </ul>
                    </div>

                    {!DetectMob() && <div className="rightContent col-sm-6">
                        <h2 className="cart-heading confirm-booking-heading">Confirm Booking</h2>
                        <div>
                            <div className="items total-container">
                                <div className="total-wrap width100 clearfix">
                                    <div className="total-text width60">Sub Total </div>
                                    <div className="total-value width40">₹ {finalSubTotal}</div>
                                </div>
                                <div className="total-wrap width100 clearfix">
                                    <div className="total-text width60">Convenience Fee </div>
                                    <div className="total-value width40">₹ {convenienceChargesTotal}</div>
                                </div>
                                <div className="total-wrap width100 clearfix">
                                    <div className="total-text width60">Taxes({taxes[0].name} {taxes[0].value}%) </div>
                                    <div className="total-value width40">₹ {taxes[0].total.toFixed(2)}</div>
                                </div>
                                <div className="total-wrap width100 clearfix">
                                    <div className="total-text width60">Total Payable Amount </div>
                                    <div className="total-value width40">₹ {total}</div>
                                </div>
                                <div className="note">
                                    <div className="width100"> Required Material cost is excluded from the above amount.</div>
                                    <div className="width100"> Additional charges will be adjusted against the final bill, after the inspection.</div>
                                    {isAnyEmergencyServiceAvl && <div className="width100">Convenience fee applied per service, and it will be vary on the basis of selected booking time at checkout.</div>}
                                    {!isAnyEmergencyServiceAvl && <div className="width100">Convenience fee applied per service.</div>}
                                    <div className="width100">Pay Online after your service approval.</div>
                                    <div className="width100">The Company is not responsible for any transaction happening between client and vendor.</div>
                                    <div className="width100">Vendor is not authorized to buy any material for client.</div>
                                </div>
                                <div className="continue-btn-wrap d-f-ac width100">
                                    {showAddMoreServicesBtn && <div className="add-more-services width100">
                                        <Link href="categories" shallow={true}>
                                            <div className="clearfix action-btn-outer d-f-ac">
                                                <div className="clearfix action-btn-wrap">
                                                    <div className="action-btn-icon">
                                                        <SvgIcon icon="home" />
                                                    </div>
                                                    <div className="action-btn-text">Add more services</div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>}
                                    {showAddMoreServicesBtn && <div className="add-more-services width100">
                                        <Link href="checkout" shallow={true}>
                                            <div className="clearfix action-btn-outer d-f-ac">
                                                <div className="clearfix action-btn-wrap">
                                                    <div className="action-btn-icon">
                                                        <SvgIcon icon="next" />
                                                    </div>
                                                    <div className="action-btn-text">Checkout</div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>}
                                    <div className="clearfix action-btn-outer d-f-ac" onClick={() => proceedForCheckout()}>
                                        <div className="clearfix action-btn-wrap">
                                            <div className="action-btn-icon">
                                                <SvgIcon icon="next" />
                                            </div>
                                            <div className="action-btn-text">Checkout</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>}
                </div> :
                    <EmptyCart showAddMoreServicesBtn={showAddMoreServicesBtn} />
                }

                {(DetectMob() && cartBookingItems.length != 0) && <div className="items total-container-mob">
                    <div className="container-wrap">
                        <div className="total-wrap width100 clearfix">
                            <div className="total-text width60">Sub Total </div>
                            <div className="total-value width40">₹ {finalSubTotal.toFixed(2)}</div>
                        </div>
                        <div className="total-wrap width100 clearfix">
                            <div className="total-text width60">Convenience Fee </div>
                            <div className="total-value width40">₹ {convenienceChargesTotal.toFixed(2)}</div>
                        </div>
                        <div className="total-wrap width100 clearfix">
                            <div className="total-text width60">Taxes({taxes[0].name} {taxes[0].value}%)</div>
                            <div className="total-value width40">₹ {taxes[0].total.toFixed(2)}</div>
                        </div>
                        <div className="total-wrap width100 clearfix">
                            <div className="total-text width60">Total Payable Amount </div>
                            <div className="total-value width40">₹ {total.toFixed(2)}</div>
                        </div>
                        {/* <div className="note">
                        <div className="width100">Required material cost is excluded from the above amount.</div>
                        <div className="width100">Additional charges will be adjusted against the final bill, after the inspection.</div>
                        {isAnyEmergencyServiceAvl && <div className="width100">Convenience fee applied per service, and it will be vary on the basis of selected booking time at checkout.</div>}
                        {!isAnyEmergencyServiceAvl && <div className="width100">Convenience fee applied per service.</div>}
                        <div className="width100">Pay online after your service approval.</div>
                        <div className="width100">The Company is not responsible for any transaction happening between client and vendor.</div>
                        <div className="width100">Vendor is not authorized to buy any material for client.</div>
                    </div> */}
                        <div className="clearfix width100">
                            <Link href="checkout" shallow={true}>
                                <div className="clearfix action-btn-outer d-f-ac">
                                    <div className="clearfix action-btn-wrap">
                                        <div className="action-btn-icon">
                                            <SvgIcon icon="next" />
                                        </div>
                                        <div className="action-btn-text">Checkout</div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>}
                <PopularCategories categories={categories} config={{ showTitle: true }} />
            </div>
            {itemRemoveConfirmationModal && <RemoveItemCartModal handleClose={closeItemRemovePopup} activeService={serviceToRemove} />}
        </div>
    )
}

export default CartPage;
