// This file will export the basic utitlity function to use globally.
import { OFFICE_END_TIME, OFFICE_START_TIME } from "@constant/defaultValues"
import cookie from "cookie"

export function parseCookies(req: any) {
  return cookie.parse(req ? req.headers.cookie || "" : document.cookie)
}
export function parseJSON(response: any) {
  return new Promise(resolve => {
    response.text().then((body: any) => {
      resolve({
        status: response.status,
        ok: response.ok,
        json: body !== '' ? JSON.parse(body) : '{}'
      })
    })
  })
}
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
export const formatDate = (date: any, status: number) => {
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
  return new Date(timeStamp.seconds * 1000 + Math.round(timeStamp.nanoseconds / 1000000));
}
export const parseIn = (date_time: any) => {
  var d = new Date();
  d.setHours(date_time.substring(0, 2));
  d.setMinutes(date_time.substring(3, 5));
  return d;
}
export const getOfficeTimingStartDate = (date: any) => {
  var officeStartDate = new Date(date);
  officeStartDate.setHours(OFFICE_START_TIME);
  officeStartDate.setMinutes(0);
  officeStartDate.setSeconds(0);
  officeStartDate.setMilliseconds(0);
  return officeStartDate;
}
export const getOfficeTimingEndDate = (date: any) => {
  var officeEndDate = new Date(date);
  officeEndDate.setHours(OFFICE_END_TIME);
  officeEndDate.setMinutes(0);
  officeEndDate.setSeconds(0);
  officeEndDate.setMilliseconds(0);
  return officeEndDate;
}
export const isTodaysDate = (date: any) => (date.getDate() == new Date().getDate() && date.getMonth() == new Date().getMonth() && date.getFullYear() == new Date().getFullYear());
export const sortTimeSlot = (selectedDate: any, slotsArray: any) => {
  slotsArray.map((slotData: any, slotindex: number) => {
    // for regular slot and emergency slots
    // set same date to slotdate
    var oStDtFrSlot = getOfficeTimingStartDate(slotData.newDate);
    var oEdDtFrSlot = getOfficeTimingEndDate(slotData.newDate);
    if (oStDtFrSlot <= slotData.newDate && slotData.newDate <= oEdDtFrSlot) slotData.officeTimeSlot = true;
    else slotData.officeTimeSlot = false;
    //if selected date is current date
    if (isTodaysDate(selectedDate)) {
      let AOIT_DATE = new Date();
      if (slotData.officeTimeSlot) {
        AOIT_DATE.setHours(AOIT_DATE.getHours() + 2);// current date with AOIT of 2 hrs for regular office time slot 
      } else {
        AOIT_DATE = new Date(AOIT_DATE.getTime() + 45 * 60000);// current date with AOIT of 45 min for other than office time slot 
      }
      if (slotData.newDate >= AOIT_DATE) slotData.active = true;
    } else slotData.active = true;
    // if (slotindex == slotsArray.length - 1) return slotsArray;
  })
  return slotsArray;
}
export const createSlot = (selectedDate: any, start: any, end: any) => {
  function timeString(time: any) {
    let newDate = new Date(selectedDate);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);

    var hours: any = Math.floor(time / 60);
    var minutes: any = time % 60;

    newDate.setHours(hours);
    newDate.setMinutes(minutes);

    if (hours < 10) hours = "0" + hours; //optional
    if (minutes < 10) minutes = "0" + minutes;
    const ampm = (hours >= 12) ? 'PM' : 'AM';
    let hour: any = hours % 12 || 12;
    if (hour < 10) {
      hour = `0${hour}`;
    }
    return {
      newDate: newDate,
      name: `${hour}:${minutes} ${ampm}`,
      active: false,
      officeTimeSlot: false,
      isSelected: false
    };
  }
  var start = start.split(":");
  var end = end.split(":");
  start = parseInt(start[0]) * 60 + parseInt(start[1]);
  end = parseInt(end[0]) * 60 + parseInt(end[1]);
  var result = [];
  for (let time = start; time <= end; time += 30) {
    result.push(timeString(time));
  }
  return sortTimeSlot(selectedDate, result);
}
export const getTimeSlot = (selectedDate: any) => {
  let startTime: any = 0;
  let endTime: any = 24;
  startTime = `${startTime}:00:00`
  endTime = `${endTime}:00:00`
  let intervals = createSlot(selectedDate, startTime, endTime);
  intervals.splice(-1, 1);//remove midnight 12:00pm slot
  return intervals;
}
export const getDaysArray = (start: any, end: any) => {
  for (var arr = [], dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    let date = new Date(dt);
    let dateObj = {
      newDate: date,
      month: date.toLocaleString('default', { month: 'long' }).substring(0, 3),
      day: date.toLocaleString('en-us', { weekday: 'long' }).substring(0, 3),
      date: date.getDate()
    }
    arr.push(dateObj);
  }
  return arr;
};