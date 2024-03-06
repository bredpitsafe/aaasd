import type { Opaque } from './types.ts';

export type TUserName = Opaque<'TUserName', string>;

export type TUserAuthState = {
    rawToken: string;
    username: TUserName;
    exp: Date;
};
