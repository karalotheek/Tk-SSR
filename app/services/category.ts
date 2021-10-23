import { Observable } from 'rxjs';
import Firebase from "@firebase/client";

const catRef = Firebase.firestore().collection('categories');

export const getActiveCategories = () => {
  return new Observable((observer) => {
    catRef.onSnapshot((querySnapshot) => {
      let cat: any[] = [];
      querySnapshot.forEach((doc) => {
        let data = doc.data();
        if (data.active) {
          data.key = doc.id;
          cat.push(data);
        }
      });
      cat.sort((a, b) => a.index - b.index);
      observer.next(cat);
    });
  });
}
export const getCategory = (id: string) => {
  return new Observable((observer) => {
    catRef.doc(id).get().then((doc) => {
      let data: any = doc.data();
      data.key = doc.id,
        observer.next(data);
    });
  });
}