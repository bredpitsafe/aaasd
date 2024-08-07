import { decodeJwt } from 'jose';
import { isEmpty, isNil, uniq } from 'lodash-es';

import type { IKeycloakInterface, TOpenIdURL, TVerifyTokenReturnType } from '../def/index.ts';
import { Keycloak } from './singleRealm.ts';

type TMultiRealmKeycloakConstructorConfig = {
    openIdURLs: TOpenIdURL[];
    tokenCacheCheckInterval: number;
};
export class MultiRealmKeycloak implements IKeycloakInterface {
    private readonly instances: Keycloak[];

    static initialize(params: TMultiRealmKeycloakConstructorConfig) {
        // Get unique URLs from config
        const initializers = uniq(params.openIdURLs)
            // Filter out empty values since some URLs may not be provided in config
            // (e.g. when a service supports only a single realm)
            .filter((url) => !isEmpty(url))
            .map((openIdURL) =>
                Keycloak.initialize({
                    openIdURL,
                    tokenCacheCheckInterval: params.tokenCacheCheckInterval,
                }),
            );

        let initialize: () => void = () => {};
        const wrapperPromise = new Promise<void>((res) => {
            initialize = res;
        });

        const keycloak = wrapperPromise.then(async () => {
            initializers.forEach(({ initialize }) => initialize());
            const instances = await Promise.all(initializers.map(({ keycloak }) => keycloak));
            return new MultiRealmKeycloak(instances);
        });

        return { keycloak, initialize };
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
