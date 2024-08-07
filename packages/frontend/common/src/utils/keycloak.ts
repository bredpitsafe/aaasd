import type { Seconds } from '@common/types';
import type { KeycloakTokenParsed } from 'keycloak-js';
import { isString } from 'lodash-es';

import { EDomainName } from '../types/domain/evironment.ts';
import type { TSocketName } from '../types/domain/sockets.ts';
import type { TFail } from '../types/Fail';
import { FailFactory, isFail } from '../types/Fail';
import { isProductionDomain } from './environment.ts';
import { isProdEnvironment } from './url.ts';

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

export function getKeycloakDomainName(socketName: TSocketName): EDomainName {
    // If it's prod domain, we'll automatically decide to authenticate user with MS or Prod credentials
    if (isProductionDomain()) {
        return isProdEnvironment(socketName) ? EDomainName.Prod : EDomainName.Ms;
    }
    // If it's and MS or dev environment, always use MS credentials, since Prod Keycload won't even load on this domains.
    return EDomainName.Ms;
}
