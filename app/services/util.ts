import { DEFAULT_CENTER_LATITUDE, DEFAULT_CENTER_LONGITUDE, DEFAULT_DELIVERY_RADIUS } from "@constant/defaultValues";
import { AddressType } from "@type/common";

export const formatTime = (time: any) => {
  time = new Date(time);
  const hour24 = time.getHours();
  let minutes = (time.getMinutes() === 0) ? '00' : time.getMinutes();
  minutes = (minutes > 0 && minutes < 10) ? `0${minutes}` : minutes;
  const ampm = (hour24 >= 12) ? 'PM' : 'AM';
  let hour: any = hour24 % 12 || 12;
  //append zero is hour is single digit
  if (hour < 10) {
    hour = `0${hour}`;
  }
  return `${hour}:${minutes} ${ampm}`;
};
export const formatDate = (date: any, status: any) => {
  date = new Date(date);
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];
  let day = date.getDate();
  let monthIndex = date.getMonth();
  let year = date.getFullYear();
  if (status == 3) return day + 'th ' + monthNames[monthIndex] + " " + year;
  if (status == 2) return day + 'th ' + monthNames[monthIndex];
  if (status == 1) return day;
};
export const timeStampToNewDate = (timeStamp: any) => {
  return timeStamp ? (new Date(timeStamp.seconds * 1000 + Math.round(timeStamp.nanoseconds / 1000000))).toString() : '';
}

export const validateAddress = (checkPoint: any) => {
  // pune
  let centerPoint = {
    lat: DEFAULT_CENTER_LATITUDE,
    lng: DEFAULT_CENTER_LONGITUDE
  }
  //up
  // let centerPoint = {
  // lat: DEFAULT_CENTER_LATITUDE,
  // lng: DEFAULT_CENTER_LONGITUDE
  // }
  let km = DEFAULT_DELIVERY_RADIUS;
  var ky = 40000 / 360;
  var kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky;
  var dx = Math.abs(centerPoint.lng - checkPoint.lng) * kx;
  var dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky;
  if (Math.sqrt(dx * dx + dy * dy) <= km) {
    return true;
  } else return false;
}

export const setAddressObj = (selectedLocation: any, type: string) => {
  let addressObj: AddressType = {
    formattedAddress: selectedLocation.formatted_address,
    locality: '',
    state: '',
    city: '',
    area: '',
    pincode: '',
    type
  }
  if (selectedLocation.address_components) {
    for (var ac = 0; ac < selectedLocation.address_components.length; ac++) {
      var component = selectedLocation.address_components[ac];
      if (component.types.includes("route") || component.types.includes("sublocality_level_2") || component.types.includes("sublocality_level_1")) {
        if (addressObj.area) {
          addressObj.area = addressObj.area + " " + component.long_name;
        } else {
          addressObj.area = component.long_name;
        }
      } else if (component.types.includes("sublocality") || component.types.includes("locality")) {
        addressObj.city = component.long_name;
      } else if (component.types.includes('administrative_area_level_1')) {
        addressObj.state = component.long_name;
      } else if (component.types.includes('postal_code')) {
        addressObj.pincode = component.long_name;
      }
    };
  } else {
    const { terms } = selectedLocation.value;
    addressObj.formattedAddress = selectedLocation.label;
    addressObj.state = terms[terms.length - 1].value;
    addressObj.city = terms[terms.length - 2].value;
    addressObj.area = terms[terms.length - 3].value;
    addressObj.locality = terms[terms.length - 4]?.value;
  }
  return addressObj;
}