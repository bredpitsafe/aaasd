import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { authenticationPage } from '../../../../lib/page-objects/common/authentication.page';
import { dashboardPage } from '../../../../lib/page-objects/dashboard/dashboard.page';

Given(`user sees the "Authorization" page and logs in as a {string} user`, (nameUser: string) => {
    authenticationPage.authentication(nameUser);
});

Given(`user on the "Authorization" page`, () => {
    authenticationPage.checkVisible();
});

Given(`user goes on the "Dashboard" page and logs in as a {string} user`, (nameUser: string) => {
    dashboardPage.visit();
    authenticationPage.authentication(nameUser);
});
