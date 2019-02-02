import {LOGIN} from './constants';

import {Register} from '../socket/connection';

export const login = () =>  {
    return {
        type : LOGIN 
    }
}

export const register = (user) => {
    return {
        type : LOGIN 
    }
}