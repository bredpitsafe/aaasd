import type { TBasicLogger } from '@backend/utils/src/logger.ts';
import { assert } from '@common/utils/src/assert.ts';
import type { FlattenedJWSInput, JWSHeaderParameters, JWTPayload, KeyLike } from 'jose';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { isEmpty, isNil } from 'lodash-es';
import NodeCache from 'node-cache';
import { Issuer } from 'openid-client';

import type { IKeycloakInterface, TVerifyTokenReturnType } from '../def';

type TKeycloakConstructorConfig = {
    openIdURL: string;
    tokenCacheCheckInterval: number;
    logger?: TBasicLogger;
};

const WELL_KNOWN = '/.well-known/openid-configuration';

type TJwksSet = (
    protectedHeader?: JWSHeaderParameters,
    token?: FlattenedJWSInput,
) => Promise<KeyLike>;

export class Keycloak implements IKeycloakInterface {
    private jwksSet: TJwksSet;
    private issuer: Issuer;
    private tokenCache: NodeCache;

    static initialize(params: TKeycloakConstructorConfig) {
        let initialize: () => void = () => {};
        const wrapperPromise = new Promise<void>((res) => {
            initialize = res;
        });

        const keycloak = wrapperPromise.then(async () => {
            const { openIdURL, tokenCacheCheckInterval } = params;
            assert(!isEmpty(openIdURL), 'OpenID URL is empty');

            const realmUrl = `${openIdURL}${WELL_KNOWN}`;

            const issuer = await Issuer.discover(realmUrl);
            const jwksUri = issuer.metadata.jwks_uri;

            if (isNil(jwksUri)) {
                throw new Error('cannot acquire JWKS URI from provided openIdURL');
            }
            const jwksSet = createRemoteJWKSet(new URL(jwksUri));
            const tokenCache = new NodeCache({
                checkperiod: Math.round(tokenCacheCheckInterval / 1000),
            });

            return new Keycloak(jwksSet, issuer, tokenCache);
        });

        return { keycloak, initialize };
    }

    private constructor(jwksSet: TJwksSet, issuer: Issuer, tokenCache: NodeCache) {
        this.jwksSet = jwksSet;
        this.issuer = issuer;
        this.tokenCache = tokenCache;
    }

    private async parseToken(jwtStr: string): Promise<JWTPayload> {
        if (this.tokenCache.has(jwtStr)) {
            return this.tokenCache.get<JWTPayload>(jwtStr)!;
        }

        const token = (
            await jwtVerify(jwtStr, this.jwksSet, {
                issuer: this.issuer.metadata.issuer,
            })
        ).payload;
        const ttl = isNil(token.exp)
            ? 0
            : new Date(token.exp * 1_000).getTime() - new Date().getTime() / 1000;
        this.tokenCache.set(jwtStr, token, ttl);

        return token;
    }

    async getIssuer(): Promise<Issuer | undefined> {
        return this.issuer;
    }

    async verifyToken(tokenStr: string): Promise<TVerifyTokenReturnType> {
        const token = await this.parseToken(tokenStr);
        const exp = isNil(token.exp) ? new Date() : new Date(token.exp * 1_000);

        return {
            username: String(token.preferred_username),
            exp,
        };
    }
}
