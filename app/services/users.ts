import { Observable } from 'rxjs';
import Firebase from "@firebase/client";
const userRef = Firebase.firestore().collection('user');
const vendorRef = Firebase.firestore().collection('vendors');

export const getUserByPhone = (phone: any) => {
  return new Promise((res, rej) => {
    userRef.where('phone', '==', phone).get().then((querySnapshot) => {
      let user: any = []
      querySnapshot.forEach(function (doc) {
        let data = doc.data();
        data.key = doc.id;
        user.push(data);
      })
      res(user)
    })
  })
}

export const updateUser = (id: string, data: any) => {
  data.createdOn = data.createdOn || new Date();
  data.modifiedOn = new Date();
  return new Observable((observer) => {
    userRef.doc(id).set(data).then(() => {
      observer.next();
    });
  });
}
export const registerUser = (data: any) => {
  data.createdOn = new Date();
  data.modifiedOn = new Date();
  return new Observable((observer) => {
    userRef.add(data).then((doc) => {
      observer.next({
        key: doc.id,
      });
    });
  });
}
export const registerVendor = (data: any) => {
  data.createdOn = new Date();
  data.modifiedOn = new Date();
  return new Observable((observer) => {
    vendorRef.add(data).then((doc) => {
      observer.next({
        key: doc.id,
      });
    });
  });
}
export const getVendorByPhone = (phone: any) => {
  return new Observable((observer) => {
    vendorRef.where('phone', '==', phone).get().then((querySnapshot) => {
      let vendor: any = []
      querySnapshot.forEach(function (doc) {
        let data = doc.data();
        data.key = doc.id;
        vendor.push(data);
      })
      observer.next(vendor);
    })
  })
}
export const getVendors = () => {
  return new Observable((observer) => {
    vendorRef.onSnapshot((querySnapshot) => {
      let vendor: any = [];
      querySnapshot.forEach((doc) => {
        let data = doc.data();
        data.key = doc.id;
        vendor.push(data);
      });
      observer.next(vendor);
    });
  });
}
export const getUserById = (id: string) => {
  return new Observable((observer) => {
    userRef.doc(id).get().then((doc) => {
      let data: any = doc.data();
      if ('password' in data) delete data.password
      observer.next({
        key: doc.id,
        ...data
      });
    });
  });
}
