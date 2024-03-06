import { createTestProps } from '../index';

export enum EMainMenuModalSelectors {
    ResetLayoutButton = 'resetLayout',
    AddTabButton = 'addTabButton',
    AddTaskButton = 'addTaskButton',
    SwitchSocketButton = 'switchSocketButton',
    StageSwitchSelector = 'stageSwitchSelector',
    ContextMenuText = '[class*="ant-dropdown-menu"]',
}

export const EMainMenuProps = {
    [EMainMenuModalSelectors.ResetLayoutButton]: createTestProps(
        EMainMenuModalSelectors.ResetLayoutButton,
    ),
    [EMainMenuModalSelectors.AddTaskButton]: createTestProps(EMainMenuModalSelectors.AddTaskButton),
    [EMainMenuModalSelectors.AddTabButton]: createTestProps(EMainMenuModalSelectors.AddTabButton),
    [EMainMenuModalSelectors.StageSwitchSelector]: createTestProps(
        EMainMenuModalSelectors.StageSwitchSelector,
    ),
};
