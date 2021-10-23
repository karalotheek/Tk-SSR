import { REMOVE_LOGGED_IN_USER_DATA, UPDATE_LOADER_STATUS, UPDATE_LOGGED_IN_USER_DATA } from "@constant/common";

export const enableLoader = () => {
    return { type: UPDATE_LOADER_STATUS, payload: true };
}

export const disableLoader = () => {
    return { type: UPDATE_LOADER_STATUS, payload: false };
}

export const updateLoggedInUserData = (payload: any) => {
    return { type: UPDATE_LOGGED_IN_USER_DATA, payload };
}

export const removeLoggedInUserData = () => {
    return { type: REMOVE_LOGGED_IN_USER_DATA, payload: null };
}