import { createTestProps } from '../../index';

export enum EDashboardPageSelectors {
    App = 'appDashboard',
    ImportFileInput = 'importFileInput',
    SetBacktestingInput = 'setBacktestingInput',
    DashboardImportButton = 'dashboardImportButton',
    ToggleSyncModButton = 'toggleSyncModButton',
    ToggleCompactModeButton = 'toggleCompactModeButton',
    ExportCloneButton = 'exportCloneButton',
    ShareDashboardButton = 'shareDashboardButton',
    RevertChangesButton = 'revertChangesButton',
    SaveChangesButton = 'saveChangesButton',
    EditDashboardButton = 'editDashboardButton',
    AddPanelButton = 'addPanelButton',
    FocusToNowButton = 'focusToNowButton',
    SetLayoutButton = 'setLayoutButton',
    LayoutNameInput = 'layoutNameInput',
    AddLayoutNameButton = 'AddLayoutNameButton',
    SelectDashboardButton = 'selectDashboardButton',
    DashboardCard = 'dashboardCard',
    DashboardsLink = 'dashboardsLink',
    SetLayoutPopover = '[class="ant-popover-inner"]',
    SetLayoutItems = '[class*="ant-space"]',
    SetPanelItem = '[class*="ant-dropdown-menu-item"]',
    DeleteLayoutIcon = '[aria-label="delete"]',
    ChartLegends = 'chartLegends',
    TableCell = '[class*="ag-cell"]',
    TableHeader = '[class="ag-header-cell-label"]',
    TableBody = '[class*="ag-body-viewport"]',
    TableButton = '[class*="ag-icon ag-icon-tree-closed"]',
    TableRow = '[class*="ag-row-level"]',
    Grid = '[style*="transform-origin"]',
    GridItem = '[class*="react-grid-item"]',
}

export const DashboardPageProps = {
    [EDashboardPageSelectors.App]: createTestProps(EDashboardPageSelectors.App),
    [EDashboardPageSelectors.ImportFileInput]: createTestProps(
        EDashboardPageSelectors.ImportFileInput,
    ),
    [EDashboardPageSelectors.SetBacktestingInput]: createTestProps(
        EDashboardPageSelectors.SetBacktestingInput,
    ),
    [EDashboardPageSelectors.DashboardImportButton]: createTestProps(
        EDashboardPageSelectors.DashboardImportButton,
    ),
    [EDashboardPageSelectors.ToggleSyncModButton]: createTestProps(
        EDashboardPageSelectors.ToggleSyncModButton,
    ),
    [EDashboardPageSelectors.ToggleCompactModeButton]: createTestProps(
        EDashboardPageSelectors.ToggleCompactModeButton,
    ),
    [EDashboardPageSelectors.ExportCloneButton]: createTestProps(
        EDashboardPageSelectors.ExportCloneButton,
    ),
    [EDashboardPageSelectors.ShareDashboardButton]: createTestProps(
        EDashboardPageSelectors.ShareDashboardButton,
    ),
    [EDashboardPageSelectors.RevertChangesButton]: createTestProps(
        EDashboardPageSelectors.RevertChangesButton,
    ),
    [EDashboardPageSelectors.SaveChangesButton]: createTestProps(
        EDashboardPageSelectors.SaveChangesButton,
    ),
    [EDashboardPageSelectors.EditDashboardButton]: createTestProps(
        EDashboardPageSelectors.EditDashboardButton,
    ),
    [EDashboardPageSelectors.AddPanelButton]: createTestProps(
        EDashboardPageSelectors.AddPanelButton,
    ),
    [EDashboardPageSelectors.SetLayoutButton]: createTestProps(
        EDashboardPageSelectors.SetLayoutButton,
    ),
    [EDashboardPageSelectors.LayoutNameInput]: createTestProps(
        EDashboardPageSelectors.LayoutNameInput,
    ),
    [EDashboardPageSelectors.AddLayoutNameButton]: createTestProps(
        EDashboardPageSelectors.AddLayoutNameButton,
    ),
    [EDashboardPageSelectors.SelectDashboardButton]: createTestProps(
        EDashboardPageSelectors.SelectDashboardButton,
    ),
    [EDashboardPageSelectors.FocusToNowButton]: createTestProps(
        EDashboardPageSelectors.FocusToNowButton,
    ),
    [EDashboardPageSelectors.DashboardCard]: createTestProps(EDashboardPageSelectors.DashboardCard),
    [EDashboardPageSelectors.ChartLegends]: createTestProps(EDashboardPageSelectors.ChartLegends),
    [EDashboardPageSelectors.DashboardsLink]: createTestProps(
        EDashboardPageSelectors.DashboardsLink,
    ),
};
