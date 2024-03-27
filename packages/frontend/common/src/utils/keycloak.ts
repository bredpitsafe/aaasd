import { KeycloakTokenParsed } from 'keycloak-js';
import { isString } from 'lodash-es';

import { FailFactory, isFail, TFail } from '../types/Fail';
import { Seconds } from '../types/time';

const TokenFail = FailFactory('token');

function parseToken(token: string) {
    const parts = token.split('.');
    const dataPart = parts.at(1);

    if (!isString(dataPart)) {
        return TokenFail('INVALID_TOKEN');
    }

    try {
        return JSON.parse(atob(dataPart)) as KeycloakTokenParsed;
    } catch {
        return TokenFail('INVALID_TOKEN');
    }
}

export function getExpiryTimeDifference(
    token1: string,
    token2: string,
): Seconds | TFail<'[token]: INVALID_TOKEN'> {
    const tokenData1 = parseToken(token1);
    const tokenData2 = parseToken(token2);

    if (isFail(tokenData1)) return tokenData1;
    if (isFail(tokenData2)) return tokenData2;

    if (typeof tokenData1.exp !== 'number' || typeof tokenData2.exp !== 'number') {
        return TokenFail('INVALID_TOKEN');
    }

    return (tokenData1.exp - tokenData2.exp) as Seconds;
}
