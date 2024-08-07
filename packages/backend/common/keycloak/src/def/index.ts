import type { Opaque } from './types.js';

export type TVerifyTokenReturnType = {
    username: string;
    exp: Date;
};

export interface IKeycloakInterface {
    verifyToken(tokenStr: string): Promise<TVerifyTokenReturnType>;
}

export type TOpenIdURL = Opaque<'OpenIdURL', string>;
