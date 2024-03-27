import { Opaque } from '../../types';

export type TUserName = Opaque<'UserName', string>;
export type TUser = {
    username?: TUserName;
};
