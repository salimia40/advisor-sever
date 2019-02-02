import {createStore, applyMiddleware , compose} from 'redux';
import {combineReducers} from 'redux';

//reducers
import userReducer from './user/reducer';
import statusReducer from './status/reducer';


//middlewares
import socketMiddleware from './socket/middleware';

const RootReducer = combineReducers({
    userState: userReducer,
    statusState: statusReducer,
});


const initialState = {};
const middlewares = [socketMiddleware];

const store = createStore(RootReducer,initialState,compose(
    applyMiddleware(...middlewares),
    // only in dev mod for redux plugin
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()    
));

export default store;