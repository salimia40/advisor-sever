import { Protocol } from '../../../constants';
const initialState = {
    loggedIn: false,
}

export default (state = initialState, action) => {
    switch (action.type) {
        case Protocol.LOGIN:
            state.loggedIn = true;
            return { ...state };
        case Protocol.REGISTER:
            console.log('registered')
            state.loggedIn = true;
            return { ...state };
        default: return { ...state };
    }
}