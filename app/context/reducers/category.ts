import { UPDATE_CATEGORIES_DATA, REMOVE_CATEGORIES_DATA } from '@constant/categories';

export function categories(state: any = [], action: any) {
    switch (action.type) {
        case UPDATE_CATEGORIES_DATA:
            return action.payload;
        case REMOVE_CATEGORIES_DATA:
            return [];
        default:
            return state;
    }
}
