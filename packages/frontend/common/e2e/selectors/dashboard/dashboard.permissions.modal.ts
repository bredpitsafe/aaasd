import { createTestProps } from '../../index';

export enum EDashboardPermissionsModal {
    ShowPermissionsSwitch = 'showPermissionsSwitch',
    UserAddNameInput = 'userAddNameInput',
    UserAddButton = 'userAddButton',
    PermissionUserInput = '[aria-label="User Filter Input"]',
    PermissionNicknameInput = '[aria-label="Nickname Filter Input"]',
    PermissionFilterButton = '[class*="filter-button"]',
}

export const DashboardPermissionsModalProps = {
    [EDashboardPermissionsModal.ShowPermissionsSwitch]: createTestProps(
        EDashboardPermissionsModal.ShowPermissionsSwitch,
    ),
    [EDashboardPermissionsModal.UserAddNameInput]: createTestProps(
        EDashboardPermissionsModal.UserAddNameInput,
    ),
    [EDashboardPermissionsModal.UserAddButton]: createTestProps(
        EDashboardPermissionsModal.UserAddButton,
    ),
};
