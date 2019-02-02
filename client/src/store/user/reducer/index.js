import {LOGIN} from '../actions/constants';
const initialState = {
    loggedIn : false,
}

export default (state = initialState,action) => {
    switch(action.type){
        case LOGIN : 
            state.loggedIn = true;
            return {...state};
        default: return {...state};
    }
}