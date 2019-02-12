import {createStore, applyMiddleware , compose} from 'redux';
import {combineReducers} from 'redux';
import thunk from 'redux-thunk';
//reducers
import userReducer from './user/reducer';
import statusReducer from './status/reducer';
import socketReducer from './socket/reducer';
import navReducer from './navigation/reducer';


//middlewares
import socketMiddleware from './socket/middleware';

const RootReducer = combineReducers({
    userState: userReducer,
    statusState: statusReducer,
    socketState: socketReducer,
    navState: navReducer,
});

const initialState = {};
const middlewares = [thunk,socketMiddleware];

const store = createStore(RootReducer,initialState,compose(
    applyMiddleware(...middlewares),
    // only in dev mod for redux plugin
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()    
));

export default store;