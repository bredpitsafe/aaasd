import { EDashboardPermissionsModal } from '@frontend/common/e2e/selectors/dashboard/dashboard.permissions.modal';

import { Button } from '../../base/elements/button';
import { Input } from '../../base/elements/input';
import { Text } from '../../base/elements/text';
import { EConfirmModalSelectors } from '../common/confirm.modal';
import { TableContextMenu } from '../common/table/table.context-menu';
import { ETableHeaderSelectors } from '../common/table/table.header';

export enum EDashboardPermissionModalSelectors {
    UserRowText = `${EConfirmModalSelectors.ConfirmModal} [col-id="user"]`,
    NicknameRowText = `${EConfirmModalSelectors.ConfirmModal} [col-id="nickname"]`,
    PermissionRowText = `${EConfirmModalSelectors.ConfirmModal} [col-id="permissions"]`,
    ColorPermissionRowText = `[class*="style_cnPermissionIconSelected"]`,
    PermissionFilterIcon = `[class='ag-icon ag-icon-filter']`,
    DeleteUserIcon = `[aria-label="delete"]`,
    PermissionIcon = `[class="ant-scroll-number-only"]`,
    PermissionsSwitchOn = `[aria-checked="true"]`,
}

class DashboardPermissionModal extends TableContextMenu {
    readonly showPermissionsSwitch = new Button(EDashboardPermissionsModal.ShowPermissionsSwitch);
    readonly userAddNameInput = new Input(EDashboardPermissionsModal.UserAddNameInput);
    readonly userAddButton = new Button(EDashboardPermissionsModal.UserAddButton);
    readonly permissionUserInput = new Input(EDashboardPermissionsModal.PermissionUserInput, false);
    readonly permissionNicknameInput = new Input(
        EDashboardPermissionsModal.PermissionNicknameInput,
        false,
    );
    readonly permissionFilterButton = new Text(
        EDashboardPermissionsModal.PermissionFilterButton,
        false,
    );
    readonly userRowText = new Text(EDashboardPermissionModalSelectors.UserRowText, false);
    readonly nicknameRowText = new Text(EDashboardPermissionModalSelectors.NicknameRowText, false);
    readonly permissionRowText = new Text(
        EDashboardPermissionModalSelectors.PermissionRowText,
        false,
    );
    readonly permissionFilterIcon = new Button(
        EDashboardPermissionModalSelectors.PermissionFilterIcon,
        false,
    );
    readonly deleteUserIcon = new Button(EDashboardPermissionModalSelectors.DeleteUserIcon, false);
    readonly permissionIcon = new Button(EDashboardPermissionModalSelectors.PermissionIcon, false);
    readonly permissionsSwitchOn = new Button(
        EDashboardPermissionModalSelectors.PermissionsSwitchOn,
        false,
    );

    checkAllRowsContainUser(name: string): void {
        const nameTextLocator = EDashboardPermissionModalSelectors.UserRowText;
        cy.get(EConfirmModalSelectors.ConfirmModal)
            .should('be.visible')
            .then(() => {
                cy.get(nameTextLocator)
                    .not(':eq(0)') // Exclude the first row
                    .each(($elem) => {
                        cy.wrap($elem).contains(name);
                    });
            });
    }

    checkAllRowsContainNickname(name: string): void {
        const nameTextLocator = EDashboardPermissionModalSelectors.NicknameRowText;
        cy.get(EConfirmModalSelectors.ConfirmModal)
            .should('be.visible')
            .then(() => {
                cy.get(nameTextLocator)
                    .not(':eq(0)') // Exclude the first row
                    .each(($elem) => {
                        cy.wrap($elem).contains(name);
                    });
            });
    }

    checkAllRowsContainPermission(Permission: string): void {
        const nameTextLocator = EDashboardPermissionModalSelectors.PermissionRowText;
        cy.get(EConfirmModalSelectors.ConfirmModal)
            .should('be.visible')
            .then(() => {
                cy.get(nameTextLocator)
                    .not(':eq(0)') // Exclude the first row
                    .each(($elem) => {
                        cy.wrap($elem).contains(Permission.charAt(0));
                    });
            });
    }

    checkAllRowsContainColorPermission() {
        const nameTextLocator = ETableHeaderSelectors.TableRowText;
        cy.get(EConfirmModalSelectors.ConfirmModal)
            .should('be.visible')
            .then(() => {
                cy.get(nameTextLocator).each(($elem) => {
                    cy.wrap($elem).get(EDashboardPermissionModalSelectors.ColorPermissionRowText);
                });
            });
    }

    setsPermissionFilter(namePermission) {
        this.permissionFilterIcon.clickLast();
        this.setItemFilter(namePermission);
    }
}

export const dashboardPermissionModal = new DashboardPermissionModal();
