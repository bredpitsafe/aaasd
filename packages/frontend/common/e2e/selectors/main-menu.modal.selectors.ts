import { createTestProps } from '../index';

export enum EMainMenuModalSelectors {
    MainMenuBar = 'mainMenuBar',
    TimeZone = 'timeZone',
    SaveLayoutButton = 'SaveLayoutButton',
    ResetLayoutButton = 'resetLayout',
    AddTabButton = 'addTabButton',
    AddTaskButton = 'addTaskButton',
    SwitchSocketButton = 'switchSocketButton',
    StageSwitchSelector = 'stageSwitchSelector',
    OpenSettingsButton = 'openSettingsButton',
    OpenSocketsButton = 'openSocketsButton',
    FullScreenButton = 'fullScreenButton',
    NotificationsListButton = 'notificationsListButton',
    NavBarModeButton = 'navBarModeButton',
    NavBarHideButton = 'navBarHideButton',
    ContextMenuText = '[class*="ant-dropdown-menu"]',
    OpenSubscriptionsTableButton = '[class="ant-btn css-dev-only-do-not-override-ixblex ant-btn-default"]',
    CloseSocketButton = '[class="ant-drawer-close"]',
    CloseSubscriptionsTableButton = '[class*="ant-modal-close-icon"]',
}

export const EMainMenuProps = {
    [EMainMenuModalSelectors.MainMenuBar]: createTestProps(EMainMenuModalSelectors.MainMenuBar),
    [EMainMenuModalSelectors.TimeZone]: createTestProps(EMainMenuModalSelectors.TimeZone),
    [EMainMenuModalSelectors.SaveLayoutButton]: createTestProps(
        EMainMenuModalSelectors.SaveLayoutButton,
    ),
    [EMainMenuModalSelectors.ResetLayoutButton]: createTestProps(
        EMainMenuModalSelectors.ResetLayoutButton,
    ),
    [EMainMenuModalSelectors.OpenSettingsButton]: createTestProps(
        EMainMenuModalSelectors.OpenSettingsButton,
    ),
    [EMainMenuModalSelectors.OpenSocketsButton]: createTestProps(
        EMainMenuModalSelectors.OpenSocketsButton,
    ),
    [EMainMenuModalSelectors.AddTaskButton]: createTestProps(EMainMenuModalSelectors.AddTaskButton),
    [EMainMenuModalSelectors.AddTabButton]: createTestProps(EMainMenuModalSelectors.AddTabButton),
    [EMainMenuModalSelectors.StageSwitchSelector]: createTestProps(
        EMainMenuModalSelectors.StageSwitchSelector,
    ),
    [EMainMenuModalSelectors.FullScreenButton]: createTestProps(
        EMainMenuModalSelectors.FullScreenButton,
    ),
    [EMainMenuModalSelectors.NotificationsListButton]: createTestProps(
        EMainMenuModalSelectors.NotificationsListButton,
    ),
    [EMainMenuModalSelectors.NavBarModeButton]: createTestProps(
        EMainMenuModalSelectors.NavBarModeButton,
    ),
    [EMainMenuModalSelectors.NavBarHideButton]: createTestProps(
        EMainMenuModalSelectors.NavBarHideButton,
    ),
};
