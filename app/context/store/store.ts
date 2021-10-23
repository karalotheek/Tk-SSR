import { createStore, applyMiddleware, combineReducers } from 'redux'
// import logger from "redux-logger";
import rootReducer from "@reducer/index";
import { composeWithDevTools } from "redux-devtools-extension";
import { MakeStore, HYDRATE, createWrapper, Context } from "next-redux-wrapper";


const bindMiddleware = (middleware: any) => {
    if (process.env.NODE_ENV !== 'production') {
        return composeWithDevTools(applyMiddleware(...middleware))
    }
    return applyMiddleware(...middleware)
}

const reducer = (state: any, action: any) => {
    if (action.type === HYDRATE) {
        const nextState = {
            ...state, // use previous state
            ...action.payload, // apply delta from hydration
        }
        if (state.categories) nextState.categories = state.categories // preserve count value on client side navigation
        return nextState
    } else {
        return rootReducer(state, action)
    }
}

export const makeStore = (context: Context) => {
    return createStore(reducer, bindMiddleware([]))
};

export const wrapper = createWrapper(makeStore, { debug: true });
