import {Protocol} from '../../../constants';

export const login = (user) =>  {
    return {
        type : Protocol.LOGIN,
        user : user
    }
}

export const register = (user) => {
    return {
        type : Protocol.DO_REGISTER,
        user : user
    }
}