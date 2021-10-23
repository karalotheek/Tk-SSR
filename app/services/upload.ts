import Firebase from "@firebase/client";
import { Observable } from 'rxjs';

// from ==> category or service
// type => small or large

export const uploadImage = (image: any, from: any, type: any) => {
    let basePath = '/uploads';
    let fileName = '';
    let filePath = '';

    let date = new Date();
    let id = date.getTime().toString();
    fileName = (type ? type : '') + 'pic' + id + '.jpg';
    filePath = basePath + '/' + from + '/' + fileName;

    let storageRef = Firebase.storage().ref();
    let uploadTask = storageRef.child(filePath).putString(image, 'data_url');


    uploadTask.on('state_changed', function (snapshot) {
        // let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // console.log('Upload is ' + progress + '% done');
        // switch (snapshot.state) {
        //   case firebase.storage.TaskState.PAUSED: // or 'paused'
        //     console.log('Upload is paused');
        //     break;
        //   case firebase.storage.TaskState.RUNNING: // or 'running'
        //     console.log('Upload is running');
        //     break;
        // }
    }, function (error) {
        // console.log(error);
    }, function () {
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
            // console.log('File available at', downloadURL);
            // callBack(downloadURL, bucketIndex, imageIndex);
        });
    });

    return new Observable((observer) => {
        uploadTask.on('state_changed', function (snapshot) {

            // let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            // console.log('Upload is ' + progress + '% done');
            // switch (snapshot.state) {
            //   case firebase.storage.TaskState.PAUSED: // or 'paused'
            //     console.log('Upload is paused');
            //     break;
            //   case firebase.storage.TaskState.RUNNING: // or 'running'
            //     console.log('Upload is running');
            //     break;
            // }
        }, function (error) {
            // console.log(error);
        }, function () {
            uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                observer.next(downloadURL);
                // callBack(downloadURL, bucketIndex, imageIndex);
            });
        });
    });
}

export const deleteImage = (imageUrl: any) => {
    let storageRef = Firebase.storage().ref();
    storageRef.storage.refFromURL(imageUrl).delete();
}

