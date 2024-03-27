import { MultiRealmKeycloak } from '@backend/keycloak';

import { config } from './config.ts';

export const keycloak = MultiRealmKeycloak.initialize({
    openIdURLs: [config.oauth.devUrl, config.oauth.prodUrl],
    tokenCacheCheckInterval: config.oauth.tokenCacheCheckInterval / 1000,
});
