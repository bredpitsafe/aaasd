import { createTestProps } from '../index';

export enum EAuthenticationSelectors {
    LogOutButton = 'logOutButton',
}
export const AuthenticationProps = {
    [EAuthenticationSelectors.LogOutButton]: createTestProps(EAuthenticationSelectors.LogOutButton),
};
