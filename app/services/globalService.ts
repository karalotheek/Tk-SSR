import { getUserByPhone } from "@services/users";
import { windowRef } from "@services/window";
import { isIOSDevice, isSafariDevice } from "@util/DetectUserAgent";

export const getUserData = (phone: any) => {
    getUserByPhone(phone).then((user: any) => {
        setLoggedInUserData(user[0]);
    })
}

//   getNotifications() {
//     if (this.loggedInUserData) {
//       this.otherService.getActiveNotifications(this.loggedInUserData.key).subscribe((data) => {
//         if (data.length != 0) {
//           this.notificationList = data;
//         } else this.notificationList = [];
//       })
//     }
//   }

export const setLoggedInUserData = (data: any) => {
    // this.loggedInUserData = data;
    // this.webstorageService.setValueInLocalStorage("loggedInUserData", this.loggedInUserData);
    // this.getNotifications();
}
export const removeLoggedInUserData = () => {
    // this.notificationList = [];
    // this.loggedInUserData = null;
    // this.webstorageService.removeItemFromLocalStorage("loggedInUserData");
}

export const vibrate = () => {
    if (!isIOSDevice() && !isSafariDevice()) {
        if (windowRef && window.navigator) {
            window.navigator.vibrate(200)
        }
    }
}

export const getConvenienceFee = async (bookingItems: any, activeCategoriesList: any, curatedGroupList: any, bookingDate: any) => {
    let convFeeArray: any = [];
    return new Promise((res, rej) => {
        bookingItems.map((bookingItemData: any, itemIndex: number) => {
            let category = activeCategoriesList.filter((data: any) => data.key == bookingItemData.categoryId);
            let categoryConvFee = category[0].convFee ? Number(category[0].convFee) : 0;
            let categoryId = bookingItemData.categoryId;
            let serviceId = bookingItemData.key;

            var curationListInterval = setInterval(() => {
                if (curatedGroupList && curatedGroupList.length) {
                    clearInterval(curationListInterval);
                    let isOtherThanOfficeTiming = true;
                    const start_time = 10;
                    const end_time = 18;
                    let currentTime = new Date(bookingDate);
                    let startTimeNewDate = new Date(bookingDate);
                    startTimeNewDate = new Date(startTimeNewDate.setHours(start_time));
                    startTimeNewDate = new Date(startTimeNewDate.setMinutes(0));
                    startTimeNewDate = new Date(startTimeNewDate.setSeconds(0));
                    startTimeNewDate = new Date(startTimeNewDate.setMilliseconds(0));

                    let endTimeNewDate = new Date(bookingDate);
                    endTimeNewDate = new Date(endTimeNewDate.setHours(end_time));
                    endTimeNewDate = new Date(endTimeNewDate.setMinutes(0));
                    endTimeNewDate = new Date(endTimeNewDate.setSeconds(0));
                    endTimeNewDate = new Date(endTimeNewDate.setMilliseconds(0));

                    if (currentTime >= startTimeNewDate && currentTime <= endTimeNewDate) {
                        isOtherThanOfficeTiming = false;
                    }

                    const emergencyServiceGroupData = curatedGroupList.filter((groupData: any) => groupData.tag.toLowerCase().includes('emergency'));
                    if (isOtherThanOfficeTiming) {
                        if (emergencyServiceGroupData[0].type == 'Category') {
                            let avlCuratedItem = emergencyServiceGroupData[0].curatedItems.filter((groupCategory: any) => groupCategory.categoryId == categoryId);
                            if (avlCuratedItem.length) {
                                let convFee = avlCuratedItem[0].convFee ? Number(avlCuratedItem[0].convFee) : 0;
                                convFeeArray.push(convFee < categoryConvFee ? categoryConvFee : Number(convFee));
                            } else convFeeArray.push(categoryConvFee);
                            if (itemIndex == bookingItems.length - 1) {
                                res(convFeeArray);
                            }
                        } else {
                            let avlCuratedItem = emergencyServiceGroupData[0].curatedItems.filter((groupCategory: any) => groupCategory.categoryId == categoryId && groupCategory.serviceId == serviceId);
                            if (avlCuratedItem.length) {
                                let convFee = avlCuratedItem[0].convFee ? Number(avlCuratedItem[0].convFee) : 0;
                                convFeeArray.push(convFee < categoryConvFee ? categoryConvFee : Number(convFee));
                            } else convFeeArray.push(categoryConvFee);
                            if (itemIndex == bookingItems.length - 1) {
                                res(convFeeArray);
                            }
                        }
                    } else {
                        convFeeArray.push(categoryConvFee);
                        if (itemIndex == bookingItems.length - 1) {
                            res(convFeeArray);
                        }
                    }
                } else {
                    convFeeArray.push(categoryConvFee);
                    if (itemIndex == bookingItems.length - 1) {
                        res(convFeeArray);
                    }
                }
            })
        })
    })
}
export const emergencyServiceCheck = (curatedGroupList: any, categoryId: any, serviceId: any) => {
    return new Promise((res, rej) => {
        const emergencyServiceGroupData = curatedGroupList.filter((groupData: any) => groupData.tag.toLowerCase().includes('emergency'));
        if (curatedGroupList && curatedGroupList.length && emergencyServiceGroupData.length != 0) {
            if (emergencyServiceGroupData[0].type == 'Category') {
                let isAvl = emergencyServiceGroupData[0].curatedItems.filter((groupCategory: any) => groupCategory.categoryId == categoryId);
                res(isAvl.length != 0);
            } else {
                let isAvl = emergencyServiceGroupData[0].curatedItems.filter((groupCategory: any) => groupCategory.categoryId == categoryId && groupCategory.serviceId == serviceId);
                res(isAvl.length != 0);
            }
        } else res(false);
    })



}
/* export const setActiveNav = (nav) => {
    this.activeRout = nav;
    this.toggleClass(null, true);
    if (nav == 'currentbookingstatus') {
        this.router.navigate(['/myaccount/1']);
    } else if (nav == 'logout') {
        this.removeLoggedInUserData();
        this.loggedInUserData = null;
    } else {
        this.router.navigate([`/${nav}`]);
    }
    // switch (nav) {
    // case nav.includes('-services'):
    //   let activeCategory = this.webstorageService.getValueFromLocalStorage('activeCategory');
    //   //  changeActiveCategory this function changes the activeCategory value inside BehaviorSubject by calling next which is observable so that
    //   // when data changes inside this obj then category compo subscribe to it and update own component regarding new category value
    //   this.changeActiveCategory(activeCategory);
    //   break;
    // }
    if (nav == 'currentbookingstatus') this.activeRout = 'currentbookingstatus';
}; */