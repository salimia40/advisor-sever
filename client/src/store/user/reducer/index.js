import { Protocol } from '../../../constants';
const initialState = {
    loggedIn: false,
    user: null,
}

export default (state = initialState, action) => {
    let reduced;
    switch (action.type) {
        case Protocol.ON_LOGIN:
            reduced = Object.assign({}, state, {
                loggedIn: true,
                user: action.user
            })
            break;
            
        case Protocol.UPDATE_USER:
            reduced = Object.assign({}, state, {
                user: action.user
            })
            break;
        case Protocol.LOGOUT:
            reduced = Object.assign({}, state, {
                loggedIn: false,
                user: null
            })
            break;

        default: reduced = state;
    }
    return reduced;
}