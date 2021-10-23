import { Observable } from 'rxjs';
import Firebase from "@firebase/client";
import { timeStampToNewDate } from './util';
const curnRef = Firebase.firestore().collection('curations');

export const getActiveCurations = () => {
    return new Observable((observer) => {
        curnRef.onSnapshot((querySnapshot) => {
            let curn: any = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                if (data.active) {
                    data.key = doc.id;
                    data.fromDate = timeStampToNewDate(data.fromDate);
                    data.toDate = timeStampToNewDate(data.toDate);
                    data.fromTime = timeStampToNewDate(data.fromTime);
                    data.toTime = timeStampToNewDate(data.toTime);
                    curn.push(data);
                }
            });
            curn.sort((a: any, b: any) => a.index - b.index);
            observer.next(curn);
        });
    });
}