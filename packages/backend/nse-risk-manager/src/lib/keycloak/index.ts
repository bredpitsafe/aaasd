import { assert } from '@frontend/common/src/utils/assert';
import { logger } from '@frontend/common/src/utils/Tracing';
import { isNil } from 'lodash-es';
import fetch from 'node-fetch';

import { config } from '../config';

export const getToken = async (): Promise<string> => {
    // @see https://wjw465150.gitbooks.io/keycloak-documentation/content/server_admin/topics/clients/oidc/service-accounts.html
    const url = `${config.server.oauth.url}/protocol/openid-connect/token`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=password&client_id=${config.server.oauth.clientId}&username=${config.server.oauth.login}&password=${config.server.oauth.password}`,
    });

    const data = (await response.json()) as { access_token?: string } | undefined;
    logger.info(`[Auth] token received`);
    const token = data?.access_token;
    assert(!isNil(token), 'request authentication failed');

    return token;
};
