import { Observable } from 'rxjs';
import Firebase from "@firebase/client";

const addressRef = Firebase.firestore().collection('address');

export const getAddressById = (id: any) => {
    return new Observable((observer) => {
        addressRef.onSnapshot((querySnapshot) => {
            let user: any[] = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                if (doc.id == id) {
                    data.key = doc.id;
                    user.push(data);
                }
            });
            observer.next(user);
        });
    });
}

export const addAddress = (data: any) => {
    data.createdOn = new Date();
    data.modifiedOn = new Date();
    return new Observable((observer) => {
        addressRef.add(data).then((doc) => {
            observer.next(doc.id);
        });
    });
}

export const updateAddressById = (id: string, data: any) => {
    data.createdOn = data.createdOn || new Date();
    data.modifiedOn = new Date();
    return new Observable((observer) => {
        addressRef.doc(id).set(data).then(() => {
            observer.next();
        });
    });
}

export const getAddressByUserId = (userId: any) => {
    return new Observable((observer) => {
        addressRef.where('userId', '==', userId).get().then((querySnapshot) => {
            let userAddresses: any[] = []
            querySnapshot.forEach(function (doc) {
                let data = doc.data();
                data.key = doc.id;
                userAddresses.push(data);
            })
            observer.next(userAddresses)
        })
    })
}

export const getAddresses = (id: string) => {
    return new Observable((observer) => {
        addressRef.doc(id).get().then((doc: any) => {
            let data = doc.data();
            data.key = doc.id;
            observer.next(data);
        });
    });
}
