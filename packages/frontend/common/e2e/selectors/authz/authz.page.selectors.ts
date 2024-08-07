import { createTestProps } from '../../index';

export enum EAuthzSelectors {
    App = 'appAuthUi',
}

export const AuthzProps = {
    [EAuthzSelectors.App]: createTestProps(EAuthzSelectors.App),
};
