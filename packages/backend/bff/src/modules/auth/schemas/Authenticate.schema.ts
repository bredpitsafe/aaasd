import type { TUserName } from '../../../def/user.ts';

export type TAuthenticateRequestPayload = {
    type: 'Authenticate';
    bearerToken: string;
};

export type TAuthenticateResponsePayload = {
    type: 'Authenticated';
    username: TUserName;
};
