import type { Opaque } from '@common/types';

export type TUserName = Opaque<'UserName', string>;
export type TUser = {
    username?: TUserName;
};
