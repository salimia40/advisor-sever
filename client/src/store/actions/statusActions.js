import {Protocol} from '../../constants';

export const statusChanged = (status,isError = false) => {
    return {
        type: Protocol.STATUS_CHANGED,
        status: status,
        isError:isError
    };
}