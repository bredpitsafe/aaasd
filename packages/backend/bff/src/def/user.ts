import type { Opaque } from '@common/types';

export type TUserName = Opaque<'TUserName', string>;

export type TUserAuthState = {
    rawToken: string;
    username: TUserName;
    exp: Date;
};
