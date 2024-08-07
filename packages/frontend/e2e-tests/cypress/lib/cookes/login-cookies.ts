import { TLoginCookieValues } from '../interfaces/common/loginValue';

export function setLogInCookies(loginValues: TLoginCookieValues) {
    cy.setCookie('AUTH_SESSION_ID', loginValues.AUTH_SESSION_ID);
    cy.setCookie('AUTH_SESSION_ID_LEGACY', loginValues.AUTH_SESSION_ID_LEGACY);
    cy.setCookie('KEYCLOAK_IDENTITY', loginValues.KEYCLOAK_IDENTITY);
    cy.setCookie('KEYCLOAK_IDENTITY_LEGACY', loginValues.KEYCLOAK_IDENTITY_LEGACY);
    cy.setCookie('KEYCLOAK_SESSION', loginValues.KEYCLOAK_SESSION);
    cy.setCookie('KEYCLOAK_SESSION_LEGACY', loginValues.KEYCLOAK_SESSION_LEGACY);
}
