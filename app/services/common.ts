import { Observable } from 'rxjs';
import Firebase from "@firebase/client";
import { formatDate, formatTime, timeStampToNewDate } from './util';
const enquiryRef = Firebase.firestore().collection('enquiry');
const consultationRef = Firebase.firestore().collection('consultations');
const deptRef = Firebase.firestore().collection('departments');
const notificationRef = Firebase.firestore().collection('notifications');

const httpOptions = {
    // headers: new HttpHeaders({ 'Content-Type': 'application/json', 'mode': 'cors', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' })
};

const httpOptionsForSMS = {
    // headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


export const submitEnquiry = (data: any) => {
    data.createdOn = new Date();
    data.modifiedOn = new Date();
    data.status = 'Pending';
    return new Observable((observer) => {
        enquiryRef.add(data).then((doc) => {
            observer.next({
                key: doc.id,
            });
        });
    });
}
export const submitQuotation = (data: any) => {
    data.createdOn = new Date();
    data.modifiedOn = new Date();
    data.status = 'Pending';
    return new Observable((observer) => {
        consultationRef.add(data).then((doc) => {
            observer.next({
                key: doc.id,
            });
        });
    });
}
export const getActiveDepartments = () => {
    return new Observable((observer) => {
        deptRef.onSnapshot((querySnapshot) => {
            let dept: any[] = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                data.key = doc.id;
                if (data.active) dept.push(data);
            });
            observer.next(dept);
        });
    });
}
export const getActiveNotifications = (userId: any) => {
    return new Observable((observer) => {
        notificationRef.onSnapshot((querySnapshot) => {
            let notification: any[] = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                if (data.userId == userId && !data.isSeen) {
                    data.key = doc.id;
                    data.notificationDateNewDate = timeStampToNewDate(data.createdOn);
                    data.displayDate = formatDate(data.notificationDateNewDate, 2);
                    data.displayTime = formatTime(data.notificationDateNewDate);
                    notification.push(data);
                }
            });
            notification.sort((a, b) => a.notificationDateNewDate - b.notificationDateNewDate);
            observer.next(notification);
        });
    })
}