import { UPDATE_SERVICES_DATA, REMOVE_SERVICES_DATA } from '@constant/services';

export function services(state: any = [], action: any) {
    switch (action.type) {
        case UPDATE_SERVICES_DATA:
            return action.payload;
        case REMOVE_SERVICES_DATA:
            return [];
        default:
            return state;
    }
}
