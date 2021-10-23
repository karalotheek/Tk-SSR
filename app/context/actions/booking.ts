import { ADD_BOOKING_ITEM, REMOVE_BOOKING_ITEM, REMOVE_BOOKING_ITEMS, UPDATE_BOOKING_ITEMS } from "@constant/booking";

export const updateBookingItems = (payload: any) => {
    return { type: UPDATE_BOOKING_ITEMS, payload };
}

export const removeBookingItems = (payload: any) => {
    return { type: REMOVE_BOOKING_ITEMS, payload };
}

export const addBookingItem = (payload: any) => {
    return { type: ADD_BOOKING_ITEM, payload };
}

export const removeBookingItem = (payload: any) => {
    return { type: REMOVE_BOOKING_ITEM, payload };
}