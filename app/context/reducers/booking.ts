import { ADD_BOOKING_ITEM, REMOVE_BOOKING_ITEM, REMOVE_BOOKING_ITEMS, UPDATE_BOOKING_ITEMS } from "@constant/booking";

export function booking(state: any = { items: [] }, action: any) {
    switch (action.type) {
        case UPDATE_BOOKING_ITEMS:
            return { ...state, items: action.payload };
        case REMOVE_BOOKING_ITEMS:
            return { ...state, items: [] };
        case ADD_BOOKING_ITEM:
            return { ...state, items: [...state.items, action.payload] }
        case REMOVE_BOOKING_ITEM:
            const bookingItems = state.items.filter((data: any) => data.key != action.payload);
            return { ...state, items: [...bookingItems] }
        default:
            return state;
    }
}
