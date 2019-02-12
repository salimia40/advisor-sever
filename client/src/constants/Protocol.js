// Messaging Protocol
export const REGISTER                   = 'user/register';
export const LOGIN                      = 'user/login';
export const ON_LOGIN                   = 'user/on-login';
export const UPDATE_USER                = 'user/update-user';
export const LOGOUT                     = 'user/logout';
export const UPDATE_EMAIL               = 'user/update-email';
export const UPDATE_NAME                = 'user/update-name';
export const UPDATE_AVATAR              = 'user/update-avatar';
export const UPDATE_BIO                 = 'user/update-bio';
export const CHANGE_PASSWORD            = 'user/change-password';

export const CONNECT                    = 'connect';
export const DISCONNECT                 = 'disconnect';
export const CONNECT_ERR                = 'connect_error';
export const RECONNECT_ERR              = 'reconnect_error';
export const UPDATE_CLIENT              = 'update_client';

export const CONNECTION_CHANGED         = 'socket/connection-changed';
export const PORT_CHANGED               = 'socket/port-changed';
export const CONNECT_SOCKET             = 'socket/connect';
export const DISCONNECT_SOCKET          = 'socket/disconnect';
export const STATUS_CHANGED             = 'status/status-changed';