import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { TDashboardData } from '../../../../lib/interfaces/dashboard/dashboardData';
import { THerodotusTradesData } from '../../../../lib/interfaces/herodotus-trades/herodotusTradesData';
import { EPagesUrl } from '../../../../lib/interfaces/url-interfaces';
import { dialogModal } from '../../../../lib/page-objects/common/dialog.modal';
import { dashboardCardModal } from '../../../../lib/page-objects/dashboard/dashboard.card.modal';
import { dashboardPage } from '../../../../lib/page-objects/dashboard/dashboard.page';
import { getDataFocusToDashboard } from '../../../data/dashboard/getDataFocusToDashboard';
import { getDataIndicatorsDashboard } from '../../../data/dashboard/getDataIndicatorDashboard';
import { getDataRobotDashboard } from '../../../data/dashboard/getDataRobotDashboard';
import { getDataRobotTaskDashboard } from '../../../data/dashboard/getDataRobotTaskDashboard';
import { getDataServerDashboard } from '../../../data/dashboard/getDataServerDashboard';
import { getDataRobotTaskT0071 } from '../../../data/herodotus-terminal/getDataRobotTaskT0071';
import { getDataRobotTaskT0158 } from '../../../data/herodotus-terminal/getDataRobotTaskT0158';
import { getDataTradesT0071 } from '../../../data/herodotus-terminal/getDataTradesT0071';
import { getDataTradesT0525 } from '../../../data/herodotus-terminal/getDataTradesT0525';

Given(`user goes to the "Dashboard" page`, () => {
    dashboardPage.visit();
});

Given(
    `user sees a modal dialog with the name {string} from the file and clicks Enter`,
    (DashboardName: string) => {
        dialogModal.checkElementsExists();
        dialogModal.nameInput.checkHaveValue(DashboardName);
        dialogModal.nameInput.type('{enter}');
    },
);

Given(`user sees the menu on the "Dashboard" page`, () => {
    dashboardPage.checkMenuVisible();
});

Given(`user sees {string} text on the "Dashboard" page`, (text: string) => {
    dashboardPage.mainTitleText.checkContain(text);
});

Given(`user sees the name of the columns in the table`, () => {
    dashboardPage.mainTitleText.checkContain('Custom View Table');
    dashboardPage.checkDataHeaderTable();
});

Given(`user opens this "Dashboard" in the page`, () => {
    dialogModal.checkElementsVisible();
    dialogModal.thisWindowButton.click();
});

Given(`user imports a file with {string} name`, (fileName: string) => {
    dashboardPage.importFileInput.uploadFile(fileName);
    dialogModal.checkElementsVisible();
});

Given(`user clicks on the {string} "Dashboard" "Delete" button`, (fileName: string) => {
    dashboardCardModal.deleteDashboardByName(fileName);
    dashboardCardModal.dashboardMenu.containsClick('Delete Dashboard');
});

Given(`user clicks on the "Dashboard" button in the menu`, () => {
    dashboardPage.dashboardsMenuButton.click();
});

Given(
    `user checks visibility of the "Dashboard" card with the {string} name`,
    (DashboardName: string) => {
        dashboardCardModal.tableBody.checkContain(DashboardName);
    },
);

Given(
    `user goes to the "Dashboard" page from {string}`,
    (nameDashboard: string, data: TDashboardData) => {
        switch (nameDashboard) {
            case 'RobotDashboard':
                data = getDataRobotDashboard();
                break;
            case 'Indicators':
                data = getDataIndicatorsDashboard();
                break;
            case 'RobotTaskDashboard':
                data = getDataRobotTaskDashboard();
                break;
            case 'Server':
                data = getDataServerDashboard();
                break;
        }
        cy.visit(EPagesUrl.dashboard + data.URL);
    },
);

Given(`user goes to the "Dashboard" page at link by id {string}`, (nameDashboard: string) => {
    cy.visit(`${EPagesUrl.dashboard}/dashboard?storageId=${nameDashboard}`);
});

Given(`user goes to the dashboard with the "focusTo" parameter`, () => {
    const data = getDataFocusToDashboard();
    cy.visit(EPagesUrl.dashboard + data.URL);
});

Given(`user sees the correct Date parameter`, () => {
    dashboardPage.doScreenshot('focusTo');
});

Given(`user goes to the "Dashboard" page of the task with id {string}`, (numberTask: string) => {
    let data: TDashboardData;
    switch (numberTask) {
        case '71':
            data = getDataRobotTaskT0071();
            break;
        case '158':
            data = getDataRobotTaskT0158();
            break;
    }
    cy.visit(EPagesUrl.dashboard + data.URL);
});

Given(
    `user goes to the "Herodotus Trades" page of the task with id {string}`,
    (numberTask: string) => {
        let data: THerodotusTradesData;
        switch (numberTask) {
            case '71':
                data = getDataTradesT0071();
                break;
            case '525':
                data = getDataTradesT0525();
                break;
        }
        cy.visit(EPagesUrl.herodotusTrades + data.URL);
    },
);

Given(`user sees the task legend with id {string}`, (numberTask: string) => {
    let data: TDashboardData;
    switch (numberTask) {
        case '71':
            data = getDataRobotTaskT0071();
            break;
        case '158':
            data = getDataRobotTaskT0158();
            break;
    }
    dashboardPage.checkVisibleLabels(data);
});

Given(
    `user sees labels and headers {string} "Dashboard"`,
    (nameDashboard: string, data: TDashboardData) => {
        switch (nameDashboard) {
            case 'RobotDashboard':
                data = getDataRobotDashboard();
                dashboardPage.checkVisibleLabels(data);
                break;
            case 'RobotTaskDashboard':
                data = getDataRobotTaskDashboard();
                dashboardPage.checkVisibleLabels(data);
                break;
            case 'Indicators':
                data = getDataIndicatorsDashboard();
                dashboardPage.checkVisibleIndicatorLabels(data);
                break;
            case 'Server':
                data = getDataServerDashboard();
                dashboardPage.checkVisiblePanel(data);
                dashboardPage.checkVisibleLabels(data);
                break;
        }
    },
);

Given(`user sees the {string} indicator in the "Dashboard" page`, (nameIndicator: string) => {
    dashboardPage.chartLegends.contains(nameIndicator);
});

Given(`user selects the "Config" of the panel`, () => {
    dashboardPage.panelButton.get().eq(1).click();
});

Given(`user selects the "View" of the panel`, () => {
    dashboardPage.panelButton.get().eq(0).click();
});

Given(`user types a {string} into the field`, (nameFile: string) => {
    dashboardPage.panelInput.clear();
    dashboardPage.setConfig(nameFile);
});

Given(`user sees indicators and colored rows`, () => {
    dashboardPage.checkContainColorRow();
    dashboardPage.checkIndicatorColumnNotEmpty();
});

Given(`user sees the value of the columns in the grid`, () => {
    dashboardPage.checkDataHeaderGrid();
    dashboardPage.checkDataBodyGrid();
});

Given(`user sees data {string} panel on the "Dashboard" page`, (namePamel: string) => {
    switch (namePamel) {
        case 'Grid Custom View':
            dashboardPage.checkGridValue();
            break;
        case 'Table Custom View':
            dashboardPage.checkTableValue();
            break;
    }
});
