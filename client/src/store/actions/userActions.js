import {Protocol} from '../../constants';


export const login = (user) =>  {
    return {
        type : Protocol.LOGIN,
        user : user
    }
}

export const onLogin = (user) =>  {
    return {
        type : Protocol.ON_LOGIN,
        user : user,
    }
}

export const register = (user) => {
    return {
        type : Protocol.REGISTER,
        user : user
    }
}

export const updateEmail = (email) => {
    return {
        type : Protocol.UPDATE_EMAIL,
        data : {email : email}
    }
}

export const updateName = (name) => {
    return {
        type : Protocol.UPDATE_NAME,
        data : {name : name}
    }
}

export const updateBio = (bio) => {
    return {
        type : Protocol.UPDATE_BIO,
        data : {bio : bio}
    }
}

export const updateAvatar = (avatar) => {
    return {
        type : Protocol.UPDATE_AVATAR,
        data : {avatar : avatar}
    }
}

export const changePassword = (password,newPassword) => {
    return {
        type : Protocol.CHANGE_PASSWORD,
        data : {password : password,newPassword: newPassword}
    }
}

export const logout = () => {
    return {
        type : Protocol.LOGOUT
    }
}

export const onUserUpdate = (user) => {
    return {
        type : Protocol.UPDATE_USER,
        user : user
    }
}