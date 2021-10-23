import { REMOVE_LOGGED_IN_USER_DATA, UPDATE_LOADER_STATUS, UPDATE_LOGGED_IN_USER_DATA } from '@constant/common';
import { removeItemFromLocalStorage, setValueInLocalStorage } from '@services/webstorage';

//this reducer will create new key inside redux store as function name and map this in reducers/index

export function loader(state = false, action: any) {// reduxState = {loader: action.payload}
    switch (action.type) {
        case UPDATE_LOADER_STATUS:
            return (action.payload);
        default:
            return state;
    }
}


export function user(state = null, action: any) {
    switch (action.type) {
        case UPDATE_LOGGED_IN_USER_DATA:
            setValueInLocalStorage('user', action.payload.key)
            return (action.payload);
        case REMOVE_LOGGED_IN_USER_DATA:
            removeItemFromLocalStorage('user');
            return null;
        default:
            return state;
    }
}

