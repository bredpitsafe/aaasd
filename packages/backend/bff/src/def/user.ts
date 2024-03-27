import { Opaque } from '@backend/utils/src/util-types.ts';

export type TUserName = Opaque<'TUserName', string>;

export type TUserAuthState = {
    rawToken: string;
    username: TUserName;
    exp: Date;
};
