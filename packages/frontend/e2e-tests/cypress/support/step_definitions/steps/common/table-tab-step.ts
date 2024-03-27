import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { ETabUrl } from '../../../../lib/interfaces/trading-servers-manager/taps-interfaces';
import { productLogsTab } from '../../../../lib/page-objects/common/components/product-logs-tab/product-logs.tab';
import { statusMessagesTab } from '../../../../lib/page-objects/common/components/status-messages/status-messages.tab';
import { contextMenu } from '../../../../lib/page-objects/common/context.menu';
import { ETab } from '../../../../lib/page-objects/common/tab';
import { tableFilter } from '../../../../lib/page-objects/common/table/table.filter';
import { tableHeader } from '../../../../lib/page-objects/common/table/table.header';
import { ETableRowSelectors, tableRow } from '../../../../lib/page-objects/common/table/table.row';
import { ETime } from '../../../../lib/page-objects/common/time';
import { componentsModal } from '../../../../lib/page-objects/trading-servers-manager/components.modal';
import { addComponentTab } from '../../../../lib/page-objects/trading-servers-manager/components/add-component-tab/add-component.tab';
import { addTaskTab } from '../../../../lib/page-objects/trading-servers-manager/components/add-task-tab/add-task.tab';
import { configTab } from '../../../../lib/page-objects/trading-servers-manager/components/config-tab/config.tab';
import { dashboardsTab } from '../../../../lib/page-objects/trading-servers-manager/components/dashboards-tab/dashboards.tab';
import { indicatorsTab } from '../../../../lib/page-objects/trading-servers-manager/components/indicators-tab/indicators.tab';
import { indicatorsTableRow } from '../../../../lib/page-objects/trading-servers-manager/components/indicators-tab/indicators.table.row';
import { instrumentsTab } from '../../../../lib/page-objects/trading-servers-manager/components/instruments-tab/instruments.tab';
import { orderBookTab } from '../../../../lib/page-objects/trading-servers-manager/components/order-book/order-book.tab';
import { realAccountsTab } from '../../../../lib/page-objects/trading-servers-manager/components/real-accounts-tab/real-accounts.tab';
import { virtualAccountsTab } from '../../../../lib/page-objects/trading-servers-manager/components/virtual-accounts-tab/virtual-accounts.tab';
import { wsRequestTab } from '../../../../lib/page-objects/trading-servers-manager/components/ws-request/ws-request.tab';
import { tradingServersManagerPage } from '../../../../lib/page-objects/trading-servers-manager/trading-servers-manager.page';
import { customWait } from '../../../../lib/web-socket/server';
import { checkUrlInclude } from '../../../asserts/comon-url-assert';

Given(`user sees the {string} tab`, (tapName: string) => {
    tableHeader.checkNotVisibleLoading();
    componentsModal.checkVisibleTabsPanel();
    switch (tapName) {
        case ETab.instruments:
            checkUrlInclude(ETabUrl.instruments);
            tradingServersManagerPage.checkVisibleTabPanel();
            tableFilter.checkElementsExists();
            instrumentsTab.checkVisibleTable();
            break;
        case ETab.indicators:
            checkUrlInclude(ETabUrl.indicators);
            tradingServersManagerPage.checkVisibleTabPanel();
            tableFilter.checkElementsExists();
            indicatorsTab.checkVisibleTable();
            break;
        case ETab.productLogs:
            checkUrlInclude(ETabUrl.productLogs);
            tradingServersManagerPage.checkVisibleTabPanel();
            productLogsTab.checkElementsExists();
            break;
        case ETab.realAccounts:
            checkUrlInclude(ETabUrl.realAccounts);
            tradingServersManagerPage.checkVisibleTabPanel();
            tableFilter.checkElementsExists();
            realAccountsTab.checkElementsExists();
            break;
        case ETab.virtualAccounts:
            checkUrlInclude(ETabUrl.virtualAccounts);
            tradingServersManagerPage.checkVisibleTabPanel();
            tableFilter.checkElementsExists();
            virtualAccountsTab.checkElementsExists();
            break;
        case ETab.config:
            checkUrlInclude(ETabUrl.config);
            configTab.checkElementsExists();
            configTab.checkElementsNotEnable();
            configTab.checkNotExistLoadingRevisionList();
            break;
        case ETab.wsRequest:
            checkUrlInclude(ETabUrl.wsRequest);
            wsRequestTab.checkElementsExists();
            break;
        case ETab.orderBook:
            checkUrlInclude(ETabUrl.orderBook);
            orderBookTab.checkElementsExists();
            break;
        case ETab.dashboards:
            checkUrlInclude(ETabUrl.dashboards);
            tableFilter.checkElementsExists();
            dashboardsTab.checkElementsExists();
            dashboardsTab.checkVisiblyRow();
            break;
        case ETab.addTask:
            checkUrlInclude(ETabUrl.addTask);
            addTaskTab.checkElementsExists();
            break;
        case ETab.statusMessages:
            checkUrlInclude(ETabUrl.statusMessages);
            statusMessagesTab.checkElementsExists();
            break;
        case ETab.activeOrders:
            checkUrlInclude(ETabUrl.activeOrders);
            break;
        case ETab.addComponent:
            checkUrlInclude(ETabUrl.addComponent);
            addComponentTab.checkElementsExists();
            addComponentTab.createButton.checkNotEnabled();
            break;
    }
});

Given(`user sees {string} names in the table`, (name: string) => {
    customWait(1);
    tableHeader.checkVisibleRowsTable();
    tableRow.checkAllRowsContainText(name);
    tableHeader.tableBody.checkNotContain('No Rows To Show');
});

Given(`user sees {string} dashboard name in the table`, (name: string) => {
    customWait(1);
    tableHeader.checkVisibleRowsTable();
    tableRow.checkAllRowsContainDashboardName(name);
    tableHeader.tableBody.checkNotContain('No Rows To Show');
});

Given(`user checks the {string} link in the name`, (linkName: string) => {
    tableRow.dashboardLinkText
        .get()
        .last()
        .should(($element) => {
            expect($element.is('a')).to.be.true;
            expect($element.attr('href')).to.equal(linkName);
        });
});

Given(
    `user checks the {string} link in the name in the "Herodotus Terminal"`,
    (linkName: string) => {
        tableRow.dashboardLinkText
            .get()
            .first()
            .should(($element) => {
                expect($element.is('a')).to.be.true;
                expect($element.attr('href')).to.equal(linkName);
            });
    },
);

Given(`user don't sees {string} names in the table`, (name: string) => {
    tableHeader.checkVisibleRowsTable();
    tableRow.checkAllRowsNotContainText(name);
});

Given(`user types {string} in the input field`, (name: string) => {
    tableHeader.checkVisibleRowsTable();
    tableFilter.nameInput.typeAndEnter(name);
    tableHeader.checkVisibleRowsTable();
    customWait(0.5);
});

Given(`user clicks on the first "Arrow" button in the table row`, () => {
    tableRow.clickFirstArrow();
});

Given(`user clicks header table {string} button`, (nameButton: string) => {
    tableHeader.checkVisibleRowsTable();
    tableHeader.clickHeaderByName(nameButton);
    tableHeader.checkVisibleRowsTable();
});

Given(`user clicks on the table header {string} twice`, (nameButton: string) => {
    tableHeader.checkVisibleRowsTable();
    tableHeader.clickHeaderByName(nameButton);
    tableHeader.clickHeaderByName(nameButton);
    tableHeader.checkVisibleRowsTable();
});

Given(`user sees the new {string} tab`, (nameDashboard: string) => {
    componentsModal.checkNewTabOpen(nameDashboard);
});

Given(`user clicks the {string} name in the table`, (name: string) => {
    tableRow.nameRowText.containsClick(name);
});

Given(`user clicks the {string} dashboard name in the table`, (name: string) => {
    tableRow.dashboardRowText.containsClick(name);
});

Given(
    `user selects a {string} that contains the name {string}`,
    (nameRow: string, name: string) => {
        indicatorsTableRow.publisherRowText.get().first().contains(name).click();
        switch (nameRow) {
            case 'Two Rows':
                indicatorsTableRow.publisherRowText
                    .get()
                    .last()
                    .contains(name)
                    .trigger('click', { ctrlKey: true });
                break;
            case 'All Rows':
                indicatorsTableRow.publisherRowText
                    .get()
                    .last()
                    .contains(name)
                    .trigger('click', { shiftKey: true });
                break;
        }
    },
);

Given(
    `user copies the {string} value of the {string} via the context menu`,
    (name: string, nameCopy: string) => {
        switch (nameCopy) {
            case 'Row':
                indicatorsTableRow.publisherRowText.containsClick(name);
                indicatorsTableRow.publisherRowText.containsRightClick(name);
                contextMenu.contextMenu.containsClick('Copy');
                break;
            case 'Rows':
                indicatorsTableRow.publisherRowText.containsRightClick(name);
                contextMenu.contextMenu.containsClick('Copy');
                break;
            case 'Cell':
                indicatorsTableRow.publisherRowText.containsRightClick(name);
                contextMenu.contextMenu.containsClick('Copy Cell');
                break;
        }
    },
);

Given(
    `user copies the {string} value of the {string} using the CTRL+C command`,
    (name: string, nameCopy: string) => {
        switch (nameCopy) {
            case 'Row':
                indicatorsTableRow.publisherRowText.get().last().contains(name).type('{ctrl}c');
                break;
        }
    },
);

Given(`user checks the copied {string} from the "Indicators" tab`, (nameCopy: string) => {
    indicatorsTableRow.checkDownloadText(nameCopy);
});

Given(`user clicks the {string} component in the table`, (name: string) => {
    tableHeader.checkVisibleRowsTable();
    tableRow.componentRowText.containsClick(name);
});

Given(
    `user clicks the {string} component in the table and selects context menu of {string} and {string}`,
    (name: string, nameItem: string, nameExport: string) => {
        tableHeader.checkVisibleRowsTable();
        tableRow.componentRowText.containsRightClick(name);
        contextMenu.contextMenu.containsClick(nameItem);
        contextMenu.contextMenu.containsClick(nameExport);
    },
);

Given(
    `user sets the date {string} and {string} in the calendar`,
    (startDate: string, endDate: string) => {
        productLogsTab.sinceButton.clickClearAndType(startDate);
        productLogsTab.tillButton.clickClearAndType(endDate);
        productLogsTab.tillButton.type('{enter}');
    },
);

Given(
    `user sees set the data {string} and {string} in the calendar`,
    (startDate: string, endDate: string) => {
        productLogsTab.sinceButton.checkHaveValue(startDate);
        productLogsTab.tillButton.checkHaveValue(endDate);
    },
);

Given(
    `user sees the set date {string} and {string} in the "Time UTC" column`,
    (startDate: ETime, endDate: ETime) => {
        tableHeader.checkVisibleRowsTable();
        tableRow.checkRowsContainSetDataText(startDate, endDate);
    },
);

Given(`user clicks on the {string} button`, (nameButton: string) => {
    customWait(1);
    switch (nameButton) {
        case 'New Real Account':
            realAccountsTab.newRealAccountButton.click();
            break;
        case 'New Virtual Account':
            virtualAccountsTab.newVirtualAccountButton.click();
            break;
        case 'CSV':
            tableFilter.cvsButton.lastClick();
            break;
        case 'TSV':
            tableFilter.tsvButton.lastClick();
            break;
        case 'JSON':
            tableFilter.jsonButton.lastClick();
            break;
        case 'Dashboard':
            tableFilter.dashboardButton.lastClick();
            break;
        case 'Kind Switch':
            addComponentTab.kindSwitch.click();
            break;
        case 'Create':
            addComponentTab.createButton.click();
            break;
    }
});

Given(`user sees "No Rows To Show" in the table`, () => {
    tableHeader.tableText.contains('No Rows To Show');
});

Given(`user sees "Loading..." in the table`, () => {
    tableHeader.loadingRowText.checkVisible();
});

Given(`user checks the downloaded file with file {string}`, (nameFile: string) => {
    customWait(1);
    switch (true) {
        case nameFile.includes('.csv'):
            tableRow.checkDownloadCSVRow(nameFile);
            break;
        case nameFile.includes('.tsv'):
            tableRow.checkDownloadTSVRow(nameFile);
            break;
        case nameFile.includes('.txt'):
            tableRow.checkDownloadTXTRow(nameFile);
            break;
        case nameFile.includes('.json'):
            tableRow.checkDownloadJSONRow(nameFile);
            break;
    }
    customWait(1);
});

Given(
    `user checks the downloaded {string} file with file {string}`,
    (nameDownloadedFile: string, nameFile: string) => {
        customWait(3);
        switch (true) {
            case nameFile.includes('.csv'):
                tableRow.checkDownloadFile(nameDownloadedFile, nameFile);
                break;
            case nameFile.includes('.xlsx'):
                tableRow.checkDownloadFileXlsm(nameDownloadedFile, nameFile);
                break;
        }
    },
);

Given(`user remembers the first "Row" value in the "Instruments" table`, () => {
    tableHeader.checkVisibleRowsTable();
    indicatorsTableRow.getActualFirstRow();
});

Given(`user sees remembers "Name" value in the "Indicators" table`, () => {
    tableHeader.checkVisibleRowsTable();
    cy.get('@oldName').then((object) => {
        const lastName = object as unknown as string;
        cy.get(ETableRowSelectors.NameRowText).contains(lastName);
    });
});
