import { MultiRealmKeycloak } from '@backend/keycloak';

import { appConfig } from './appConfig.ts';

export const keycloak = MultiRealmKeycloak.initialize({
    openIdURLs: [appConfig.oauth.devUrl, appConfig.oauth.prodUrl],
    tokenCacheCheckInterval: appConfig.oauth.tokenCacheCheckInterval / 1000,
});
