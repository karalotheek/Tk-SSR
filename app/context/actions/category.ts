import { REMOVE_CATEGORIES_DATA, UPDATE_CATEGORIES_DATA } from "@constant/categories";

export const updateCategoriesData = (payload: any) => {
    return { type: UPDATE_CATEGORIES_DATA, payload };
}

export const removeCategoriesData = (payload: any) => {
    return { type: REMOVE_CATEGORIES_DATA, payload };
}