import { createTestProps } from '../index';

export enum ETableTabFilterSelectors {
    TableMenu = 'tableMenu',
    TableFilterButton = 'tableFilterButton',
    NameInput = 'taskTypeInput',
    DataInput = 'dataInput',
    RealAccountInput = '[data-test="taskTypeInput"][placeholder=" Exch. Acc. ID Internal"]',
    VirtualAccountInput = '[data-test="taskTypeInput"][placeholder="Name Internal"]',
    ActiveTasksInput = '[data-test="activeTasksTable"] [data-test="taskTypeInput"]',
    ArchivedTasksInput = '[data-test="archivedTasksTable"] [data-test="taskTypeInput"]',
    SwitchButton = 'switchButton',
    CSVButton = 'csvButton',
    TSVButton = 'tsvButton',
    JSONButton = 'jsonButton',
    DashboardButton = 'dashboardButton',
    ApplyButton = 'applyButton',
    ResetButton = 'resetButton',
    WarningIcon = '[aria-label="warning"]',
}

export const ETableTabFilterProps = {
    [ETableTabFilterSelectors.TableMenu]: createTestProps(ETableTabFilterSelectors.TableMenu),
    [ETableTabFilterSelectors.TableFilterButton]: createTestProps(
        ETableTabFilterSelectors.TableFilterButton,
    ),
    [ETableTabFilterSelectors.NameInput]: createTestProps(ETableTabFilterSelectors.NameInput),
    [ETableTabFilterSelectors.DataInput]: createTestProps(ETableTabFilterSelectors.DataInput),
    [ETableTabFilterSelectors.SwitchButton]: createTestProps(ETableTabFilterSelectors.SwitchButton),
    [ETableTabFilterSelectors.CSVButton]: createTestProps(ETableTabFilterSelectors.CSVButton),
    [ETableTabFilterSelectors.TSVButton]: createTestProps(ETableTabFilterSelectors.TSVButton),
    [ETableTabFilterSelectors.JSONButton]: createTestProps(ETableTabFilterSelectors.JSONButton),
    [ETableTabFilterSelectors.DashboardButton]: createTestProps(
        ETableTabFilterSelectors.DashboardButton,
    ),
    [ETableTabFilterSelectors.ApplyButton]: createTestProps(ETableTabFilterSelectors.ApplyButton),
    [ETableTabFilterSelectors.ResetButton]: createTestProps(ETableTabFilterSelectors.ResetButton),
};
