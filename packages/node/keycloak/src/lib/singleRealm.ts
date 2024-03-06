import {
    createRemoteJWKSet,
    FlattenedJWSInput,
    JWSHeaderParameters,
    JWTPayload,
    jwtVerify,
    KeyLike,
} from 'jose';
import { isNil } from 'lodash-es';
import NodeCache from 'node-cache';
import { BaseClient, Issuer } from 'openid-client';

import { IKeycloakInterface, TVerifyTokenReturnType } from '../def/index.ts';

type TKeycloakConstructorConfig = {
    openIdURL: string;
    tokenCacheCheckInterval: number;
};

const WELL_KNOWN = '/.well-known/openid-configuration';

type TJwksSet = (
    protectedHeader?: JWSHeaderParameters,
    token?: FlattenedJWSInput,
) => Promise<KeyLike>;

export class Keycloak implements IKeycloakInterface {
    private jwksSet: TJwksSet;
    private issuer: Issuer<BaseClient>;
    private tokenCache: NodeCache;

    static async initialize(params: TKeycloakConstructorConfig) {
        const { openIdURL, tokenCacheCheckInterval } = params;
        const issuer = await Issuer.discover(`${openIdURL}${WELL_KNOWN}`);
        const jwksUri = issuer.metadata.jwks_uri;

        if (isNil(jwksUri)) {
            throw new Error('cannot acquire JWKS URI from provided openIdURL');
        }
        const jwksSet = createRemoteJWKSet(new URL(jwksUri));
        const tokenCache = new NodeCache({
            checkperiod: Math.round(tokenCacheCheckInterval / 1000),
        });

        return new Keycloak(jwksSet, issuer, tokenCache);
    }

    private constructor(jwksSet: TJwksSet, issuer: Issuer<BaseClient>, tokenCache: NodeCache) {
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
