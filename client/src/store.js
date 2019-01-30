import {createStore, applyMiddleware , compose} from 'redux';
import thunk from 'redux-thunk';
import RootReducer from './reducers';

const initialState = {};
const middlewares = [thunk];

const store = createStore(RootReducer,initialState,compose(
    applyMiddleware(...middlewares),
    // only in dev mod for redux plugin
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()    
));

export default store;