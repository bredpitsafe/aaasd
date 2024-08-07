import { MultiRealmKeycloak } from '@backend/keycloak';
import type { TOpenIdURL } from '@backend/keycloak/src/def';
import { isNil } from 'lodash-es';

import { appConfig } from './appConfig.ts';

export const { keycloak, initialize: initializeKeycloakClient } = MultiRealmKeycloak.initialize({
    openIdURLs: [appConfig.oauth.url, appConfig.oauth.secondaryUrl].filter(
        (v): v is TOpenIdURL => !isNil(v),
    ),
    tokenCacheCheckInterval: appConfig.oauth.tokenCacheCheckInterval / 1000,
});
