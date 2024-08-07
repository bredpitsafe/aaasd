import { createTestProps } from '../../index';

export enum EDashboardChooseMenuSelectors {
    DashboardChooseMenuList = 'dashboardChooseMenuList',
    AddDashboardButton = 'addDashboardButton',
    CloseDashboardChooseMenuButton = '[data-test="dashboardChooseMenuList"] [aria-label="close"]',
    DashboardContextMenu = '[class*="ag-menu-list"]',
    DashboardNameInput = '[class*="ant-input"]',
}
export const DashboardChooseMenuProps = {
    [EDashboardChooseMenuSelectors.DashboardChooseMenuList]: createTestProps(
        EDashboardChooseMenuSelectors.DashboardChooseMenuList,
    ),
    [EDashboardChooseMenuSelectors.AddDashboardButton]: createTestProps(
        EDashboardChooseMenuSelectors.AddDashboardButton,
    ),
};
