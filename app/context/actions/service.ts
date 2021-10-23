import { REMOVE_SERVICES_DATA, UPDATE_SERVICES_DATA } from "@constant/services";

export const updateServicesData = (payload: any) => {
    return { type: UPDATE_SERVICES_DATA, payload };
}

export const removeServicesData = (payload: any) => {
    return { type: REMOVE_SERVICES_DATA, payload };
}