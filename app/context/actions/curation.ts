import { REMOVE_CURATION_DATA, UPDATE_CURATION_DATA } from "@constant/curation";

export const updateCurationData = (payload: any) => {
    return { type: UPDATE_CURATION_DATA, payload };
}

export const removeCurationData = (payload: any) => {
    return { type: REMOVE_CURATION_DATA, payload };
}