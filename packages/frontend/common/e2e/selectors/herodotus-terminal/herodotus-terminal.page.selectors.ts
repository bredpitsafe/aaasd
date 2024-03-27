import { createTestProps } from '../../index';

export enum EHerodotusTerminalSelectors {
    App = 'appHerodotusTerminal',
    RobotsButton = 'robotsButton',
    RobotsMenu = '[class="ant-drawer-content-wrapper"]',
    SaveRoleButton = 'saveRoleButton',
    ResetRoleButton = 'resetRoleButton',
}

export const HerodotusTerminalProps = {
    [EHerodotusTerminalSelectors.App]: createTestProps(EHerodotusTerminalSelectors.App),
    [EHerodotusTerminalSelectors.RobotsButton]: createTestProps(
        EHerodotusTerminalSelectors.RobotsButton,
    ),
    [EHerodotusTerminalSelectors.RobotsMenu]: createTestProps(
        EHerodotusTerminalSelectors.RobotsMenu,
    ),
    [EHerodotusTerminalSelectors.SaveRoleButton]: createTestProps(
        EHerodotusTerminalSelectors.SaveRoleButton,
    ),
    [EHerodotusTerminalSelectors.ResetRoleButton]: createTestProps(
        EHerodotusTerminalSelectors.ResetRoleButton,
    ),
};
