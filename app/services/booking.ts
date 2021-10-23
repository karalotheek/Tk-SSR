import { Observable } from 'rxjs';
import Firebase from "@firebase/client";
import { formatDate, formatTime, timeStampToNewDate } from '@util/utils';

const bookingRef = Firebase.firestore().collection('bookings');
const paymentRef = Firebase.firestore().collection('payments');

export const saveBooking = (data: any) => {
    data.createdOn = new Date();
    data.modifiedOn = new Date();
    return new Observable((observer) => {
        bookingRef.add(data).then((doc) => {
            observer.next({
                key: doc.id,
            });
        });
    });
}

export const getBookingsByPhone = (phone: any) => {
    return new Observable((observer) => {
        bookingRef.onSnapshot((querySnapshot) => {
            let user: any[] = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                if (data.phone == phone) {
                    data.key = doc.id;
                    data.bookingDateNewDate = timeStampToNewDate(data.bookingDate);
                    data.displayDate = formatDate(data.bookingDateNewDate, 3);
                    data.displayTime = formatTime(data.bookingDateNewDate);
                    user.push(data);
                }
            });
            observer.next(user);
        });
    });
}
export const getBookingCount = () => {
    return new Observable((observer) => {
        bookingRef.onSnapshot((querySnapshot) => {
            observer.next(querySnapshot.size);
        });
    });
}
export const canceleBooking = (id: any, remark: any) => {
    return new Observable((observer) => {
        bookingRef.doc(`/${id}`).update({ 'cancelationRemark': remark, 'status': 'Cancelled' }).then(() => {
            observer.next();
        });
    });
}
export const updateBookingPaymentStatus = (id: any, value: any, bookingData: any) => {
    let totalPaidAmount = bookingData.paidAmount + bookingData.paymentAmount;
    let settledAmount = ((bookingData.total - totalPaidAmount) <= 0) ? 0 : (bookingData.total - totalPaidAmount);
    let status = settledAmount != 0 ? 'Pending' : 'Paid';
    return new Observable((observer) => {
        bookingRef.doc(`/${id}`).update({ 'paymentStatus': status, 'paidAmount': totalPaidAmount, 'settledAmount': settledAmount }).then(() => {
            observer.next();
        });
    });
}
export const getPaymentDetails = (bookingId: any) => {
    return new Observable((observer) => {
        paymentRef.where('ORDERID', '==', bookingId).get().then((querySnapshot) => {
            let payments: any[] = []
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                data.key = doc.id;
                payments.push(data);
            })
            observer.next(payments);
        })
    })
}
export const getBookingByInvoiceId = (invoiceId: any) => {
    return new Observable((observer) => {
        bookingRef.where('invoiceId', '==', invoiceId).get().then((querySnapshot) => {
            let booking: any[] = []
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                data.key = doc.id;
                data.bookingDateNewDate = timeStampToNewDate(data.bookingDate);
                data.displayDate = formatDate(data.bookingDateNewDate, 3);
                data.displayTime = formatTime(data.bookingDateNewDate);
                booking.push(data);
            })
            observer.next(booking);
        })
    })
}
export const submitFeedback = (id: any, data: any) => {
    return new Observable((observer) => {
        bookingRef.doc(`/${id}`).update({ 'feedback': data }).then(() => {
            observer.next();
        });
    });
}
