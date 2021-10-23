import { UPDATE_CURATION_DATA, REMOVE_CURATION_DATA } from '@constant/curation';

export function curations(state: any = { availableList: [] }, action: any) {
    switch (action.type) {
        case UPDATE_CURATION_DATA:
            return { ...state, availableList: action.payload };
        case REMOVE_CURATION_DATA:
            return { ...state, availableList: [] };
        default:
            return state;
    }
}
