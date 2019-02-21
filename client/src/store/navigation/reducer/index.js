// ACTIONS
import { Views,Protocol } from '../../../constants';
import Stack from './stack';

let stack = new Stack();
stack.push(Views.Home)

// Initial state
const INITIAL_STATE = {
    stack: stack.getItems()
};



// Status reducer
function statusReducer(state=INITIAL_STATE, action) {
    let reduced;
    switch (action.type)
    {
        case Protocol.ON_LOGIN:
        stack.empty();
        stack.push(Views.Home_LoggedIn);

        reduced = Object.assign({},state,{
            stack : stack.getItems(),
        })

        break;

        case Protocol.LOGOUT:
        stack.empty();
        stack.push(Views.Home);

        reduced = Object.assign({},state,{
            stack : stack.getItems(),
        })

        break;

        default:
            reduced = state;
            break;
    }
    return reduced;
}

export default statusReducer;