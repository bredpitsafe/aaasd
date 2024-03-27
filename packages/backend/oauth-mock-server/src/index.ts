import { isNil } from 'lodash-es';
import { Events, OAuth2Server } from 'oauth2-mock-server';

import { appConfig } from './utils/appConfig.ts';
import { getUserByName } from './utils/users.ts';

const server = new OAuth2Server();

// Generate a new RSA key and add it to the keystore
await server.issuer.keys.generate('RS256');

// Start the server
await server.start(appConfig.service.port, appConfig.service.externalURL);
console.log(`Oauth server started on port ${appConfig.service.port}`);

server.service.on(Events.BeforeTokenSigning, (token) => {
    console.log('[beforeTokenSigning] token', token);
    const user = getUserByName(token.payload.sub as string);
    console.log('[beforeTokenSigning] user', user);

    if (isNil(user)) {
        // Mark token as invalid to be processed in `beforeResponse`
        token.payload.exp = 0;
        return;
    }
    token.payload.email = user.email;
    token.payload.sub = user.id;
    token.payload.username = user.username;
    token.payload.preferred_username = user.username;

    const now = Math.floor(Date.now() / 1000);
    token.payload.exp = now + user.exp;
    console.log('[beforeTokenSigning] issued correct token', token);
});

server.service.on(Events.BeforeResponse, (res) => {
    if (res.body.expires_in === 0) {
        res.body = {
            error: 'invalid_token',
            error_message: 'invalid_token',
        };
        res.statusCode = 401;
        console.log('[beforeResponse] issued invalid token', res);
        return;
    }
});
