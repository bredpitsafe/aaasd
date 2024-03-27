import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { authenticationPage } from '../../../../lib/page-objects/common/authentication.page';

Given(`user sees the "Authorization" page and logs in as a {string} user`, (nameUser: string) => {
    authenticationPage.authentication(nameUser);
});

Given(`user on the "Authorization" page`, () => {
    authenticationPage.checkVisible();
});
