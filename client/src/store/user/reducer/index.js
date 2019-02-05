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
        default: reduced = state;
    }
    return reduced;
}