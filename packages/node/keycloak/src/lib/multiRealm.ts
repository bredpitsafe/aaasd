import { decodeJwt } from 'jose';
import { isEmpty, isNil, uniq } from 'lodash-es';

import { IKeycloakInterface, TOpenIdURL, TVerifyTokenReturnType } from '../def/index.ts';
import { Keycloak } from './singleRealm.ts';

type TMultiRealmKeycloakConstructorConfig = {
    openIdURLs: TOpenIdURL[];
    tokenCacheCheckInterval: number;
};
export class MultiRealmKeycloak implements IKeycloakInterface {
    private readonly instances: Keycloak[];

    static async initialize(params: TMultiRealmKeycloakConstructorConfig) {
        // Get unique URLs from config
        const instances = await Promise.all(
            uniq(params.openIdURLs)
                // Filter out empty values since some URLs may not be provided in config
                // (e.g. when a service supports only a single realm)
                .filter((url) => !isEmpty(url))
                .map((openIdURL) =>
                    Keycloak.initialize({
                        openIdURL,
                        tokenCacheCheckInterval: params.tokenCacheCheckInterval,
                    }),
                ),
        );
        return new MultiRealmKeycloak(instances);
    }
    private constructor(instances: Keycloak[]) {
        this.instances = instances;
    }

    async verifyToken(tokenStr: string): Promise<TVerifyTokenReturnType> {
        // Get issuer from token
        const tokenIssuer = decodeJwt(tokenStr).iss;
        if (isNil(tokenIssuer)) {
            throw new Error('token issuer is not specified');
        }

        // Get Keycloak instance by issuer and validate token with a compatible instance.
        for (const instance of this.instances) {
            const issuer = await instance.getIssuer();
            if (!isNil(issuer) && tokenIssuer === issuer.metadata.issuer) {
                return instance.verifyToken(tokenStr);
            }
        }

        throw new Error('no available Keycloak instance found based on the provided issuer');
    }
}
