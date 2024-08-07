import { testSelector } from '@frontend/common/e2e';
import { EAuthenticationSelectors } from '@frontend/common/e2e/selectors/authentication';

import { BasePage } from '../../base.page';
import { Button } from '../../base/elements/button';
import { customWait } from '../../web-socket/server';

const AuthenticationPageSelector = {
    titleText: '#kc-page-title',
    usernameInput: '#username',
    passwordInput: '#password',
    buttons: '#kc-form-buttons',
    logoutButtons: '#kc-logout-confirm',
};

const KEYCLOAK_PAGE_URL = 'ms.advsys.work';

class AuthenticationPage extends BasePage {
    readonly logOutButton = new Button(EAuthenticationSelectors.LogOutButton);

    authentication(nameUser): void {
        let username, password;

        switch (nameUser) {
            case 'Frontend':
                username = Cypress.env('KEYCLOAK_USER');
                password = Cypress.env('KEYCLOAK_USER_PASSWORD');
                break;
            case 'LimitUser':
                username = Cypress.env('KEYCLOAK_LIMIT_USER');
                password = Cypress.env('KEYCLOAK_LIMIT_USER_PASSWORD');
                break;
        }

        cy.origin(
            KEYCLOAK_PAGE_URL,
            {
                args: {
                    username,
                    password,
                    titleText: AuthenticationPageSelector.titleText,
                    usernameInput: AuthenticationPageSelector.usernameInput,
                    passwordInput: AuthenticationPageSelector.passwordInput,
                    buttons: AuthenticationPageSelector.buttons,
                },
            },
            ({ username, password, titleText, usernameInput, passwordInput, buttons }) => {
                cy.get(titleText).contains('Sign in to your account');
                cy.get(usernameInput).type(username);
                cy.get(passwordInput).type(password);
                cy.get(buttons).contains('Sign In');
                cy.get(buttons).click();
            },
        );
    }

    checkVisible(): void {
        cy.origin(
            KEYCLOAK_PAGE_URL,
            {
                args: {
                    titleText: AuthenticationPageSelector.titleText,
                    usernameInput: AuthenticationPageSelector.usernameInput,
                    passwordInput: AuthenticationPageSelector.passwordInput,
                    buttons: AuthenticationPageSelector.buttons,
                },
            },
            ({ titleText, usernameInput, passwordInput, buttons }) => {
                cy.get(titleText).contains('Sign in to your account');
                cy.get(usernameInput).should('be.visible');
                cy.get(passwordInput).should('be.visible');
                cy.get(buttons).should('be.visible');
            },
        );
    }

    clickLogOutButton(): void {
        cy.get(testSelector(EAuthenticationSelectors.LogOutButton)).within(() =>
            this.loadingIcon.checkNotExists(),
        );
        this.logOutButton.checkEnabled();
        customWait(1);
        this.logOutButton.click();
    }
}

export const authenticationPage = new AuthenticationPage();
