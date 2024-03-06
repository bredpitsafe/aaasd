import { DataTable, Given } from '@badeball/cypress-cucumber-preprocessor';
import { testSelector } from '@frontend/common/e2e';
import { ESuggestedTransfersTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/suggested-transfers/suggested-transfers.tab.selectors';

import { EPagesBalanceMonitorUrl } from '../../../../lib/interfaces/balance-monitor/page-interfaces';
import { amountLimitsRulesPage } from '../../../../lib/page-objects/balance-monitor/amount-limits-rules.page';
import { autoTransferRulesPage } from '../../../../lib/page-objects/balance-monitor/auto-transfer-rules.page';
import { balanceMonitorPage } from '../../../../lib/page-objects/balance-monitor/balance-monitor.page';
import { coinTransferDetailsTab } from '../../../../lib/page-objects/balance-monitor/components/coin-transfer-details/coin-transfer-details.tab';
import { coinsTransferDetailsTableRow } from '../../../../lib/page-objects/balance-monitor/components/coin-transfer-details/coins-transfer-details.table.row';
import { componentStatusesTab } from '../../../../lib/page-objects/balance-monitor/components/component-statuses/component-statuses.tab';
import { componentStatusesTableRow } from '../../../../lib/page-objects/balance-monitor/components/component-statuses/component-statuses.table.row';
import { distributionTab } from '../../../../lib/page-objects/balance-monitor/components/distribution/distribution.tab';
import { gatheringTab } from '../../../../lib/page-objects/balance-monitor/components/gathering/gathering.tab';
import { manualTransferTab } from '../../../../lib/page-objects/balance-monitor/components/manual-transfer/manual-transfer.tab';
import { sendDataToAnalyseTab } from '../../../../lib/page-objects/balance-monitor/components/send-data-to-analyse/send-data-to-analyse.tab';
import { suggestedTransfersTab } from '../../../../lib/page-objects/balance-monitor/components/suggested-transfers/suggested-transfers.tab';
import { suggestedTransfersTableRow } from '../../../../lib/page-objects/balance-monitor/components/suggested-transfers/suggested-transfers.table.row';
import { transfersHistoryTab } from '../../../../lib/page-objects/balance-monitor/components/transfers-history/transfers-history.tab';
import { transfersHistoryTableRow } from '../../../../lib/page-objects/balance-monitor/components/transfers-history/transfers-history.table.row';
import { internalTransfersPage } from '../../../../lib/page-objects/balance-monitor/intermal-transfers.page';
import { transferBlockingRulesPage } from '../../../../lib/page-objects/balance-monitor/transfer-blocking-rules.page';
import { confirmModal } from '../../../../lib/page-objects/common/confirm.modal';
import { contextMenu } from '../../../../lib/page-objects/common/context.menu';
import { tableFilter } from '../../../../lib/page-objects/common/table/table.filter';
import { ETableHeaderSelectors } from '../../../../lib/page-objects/common/table/table.header';
import { ETime } from '../../../../lib/page-objects/common/time';
import { customWait } from '../../../../lib/web-socket/server';
import { checkUrlInclude } from '../../../asserts/comon-url-assert';
import { getDataGathering } from '../../../data/balance-monitor/getDataGathering';
import { getDataManualTransfer } from '../../../data/balance-monitor/getDataManualTransfer';
import { getDataSuggestedTransfer } from '../../../data/balance-monitor/getDataSuggestedTransfer';
import { dateChange } from '../../../data/date';

Given(`user sees tabs on the "Balance Monitor" page`, () => {
    balanceMonitorPage.checkVisiblePanel();
});

Given(`user closes all tabs on the "Balance Monitor" page`, () => {
    balanceMonitorPage.closeButton.checkVisible();
    customWait(1);
    balanceMonitorPage.closeButton.get().each(($element) => {
        cy.wrap($element).click();
        customWait(1);
    });
});

Given(`user sees filters and "send" button in the "Suggested Transfers" table`, () => {
    tableFilter.checkElementsExists();
    suggestedTransfersTableRow.checkVisibleButtonTable();
});

Given(`user sees progress indicators in the "Suggested Transfers" table`, () => {
    suggestedTransfersTab.checkProgressIndicators();
});

Given(`user checks the {string} link in the table`, (linkName: string) => {
    transfersHistoryTab.transfersHistoryTab.get().should(($element) => {
        expect($element.is('a')).to.be.true;
        expect($element.attr('href')).to.equal(linkName);
    });
});

Given(`user sets the {string} coin in the filter selector`, (coinName: string) => {
    coinTransferDetailsTab.coinTransferFilter.clickAndType(coinName);
    customWait(1);
});

Given(`user clicks a "Refresh" button in the "Coin Transfer Details" table`, () => {
    coinTransferDetailsTab.coinRefreshButton.click();
});

Given(`user selects a coin {string} from the "Distribution"`, (coinName: string) => {
    distributionTab.coinSelector.clickAndType(coinName);
    customWait(1);
});

Given(`user sees a graph in the "Distribution" tab"`, () => {
    distributionTab.chart.checkVisible();
});

Given(`user not sees the label {string}`, (label: string) => {
    distributionTab.distributionTab.checkNotContain(label);
});

Given(`user clicks a {string} button in the "Manual Transfer" form`, (nameButton: string) => {
    switch (nameButton) {
        case 'Send':
            manualTransferTab.clickSendButton();
            break;
        case 'Clear':
            manualTransferTab.clickClearButton();
            break;
    }
});

Given(`user sees active "Send" button in the "Manual Transfer" form`, () => {
    manualTransferTab.sendButton.checkEnabled();
});

Given(`user sees not active "Send" button in the "Manual Transfer" form`, () => {
    manualTransferTab.sendButton.checkNotEnabled();
});

Given(`user selects manual transfer type values:`, (dataTable: DataTable) => {
    dataTable.hashes().forEach((element) => {
        manualTransferTab.coinSelector.clickAndType(element.coin);
        manualTransferTab.sourceSelector.clickAndType(element.source);
        manualTransferTab.destinationSelector.clickAndType(element.destination);
        manualTransferTab.amountInput.type(element.amount);
    });
});

Given(
    `user types {string} in the {string} input in the "Manual Transfer" form`,
    (value: string, nameInput) => {
        switch (nameInput) {
            case 'Percent':
                manualTransferTab.percentInput.clear();
                manualTransferTab.percentInput.typeAndEnter(value);
                break;
            case 'Amount':
                manualTransferTab.amountInput.clear();
                manualTransferTab.amountInput.type(value);
        }
    },
);

Given(`user types {string} in the "Percent" input in the "Gathering" form`, (value: string) => {
    gatheringTab.percentInput.clear();
    gatheringTab.percentInput.typeAndEnter(value);
});

Given(`user sees the {string} error message in the "Manual Transfer" form`, (error: string) => {
    manualTransferTab.manualTransferTab.contains(error);
});

Given(`user sees the {string} error message in the "Gathering" form`, (error: string) => {
    gatheringTab.gatheringTab.contains(error);
});

Given(`user sees the {string} value in the "Manual Transfer" form`, (percent: string) => {
    manualTransferTab.percentInput.checkHavePlaceholder(percent);
});

Given(`user sees the {string} value in the "Gathering" form`, (percent: string) => {
    gatheringTab.percentInput.checkHavePlaceholder(percent);
});

Given(`user selects send data type values:`, (dataTable: DataTable) => {
    dataTable.hashes().forEach((element) => {
        sendDataToAnalyseTab.coinSelector.clickAndType(element.coin);
        sendDataToAnalyseTab.commentInput.type(element.comment);
    });
});

Given(`user sees active "Send" button in the "Send data to analyse" form`, () => {
    sendDataToAnalyseTab.sendButton.checkEnabled();
});

Given(`user sees not active "Send" button in the "Send data to analyse" form`, () => {
    sendDataToAnalyseTab.sendButton.checkNotEnabled();
});

Given(`user clicks a {string} button in the "Send data to analyse" form`, (nameButton: string) => {
    switch (nameButton) {
        case 'Clear':
            sendDataToAnalyseTab.clearButton.click();
            break;
        case 'Send':
            sendDataToAnalyseTab.sendButton.click();
            break;
    }
});

Given(`user clicks on the first "Send" button in the "Suggested Transfers" table`, () => {
    cy.contains(ETableHeaderSelectors.TableRowText, '99.8% / —')
        .find(testSelector(ESuggestedTransfersTabSelectors.SendButton))
        .click();
});

Given(
    `user edits first {string} field and types {string} value`,
    (nameInput: string, value: string) => {
        switch (nameInput) {
            case 'TransferAmount':
                suggestedTransfersTableRow.transferAmountRowText.dblclickAndTypeText(value);
                break;
            case 'AccountExchange':
                suggestedTransfersTableRow.accountRowText.dblclickAndTypeText(value);
                break;
            case 'Source':
                suggestedTransfersTableRow.sourceRowText.dblclickAndSelectByText(value);
                break;
            case 'Destination':
                suggestedTransfersTableRow.destinationRowText.dblclickAndSelectByText(value);
                break;
        }
    },
);

Given(`user clicks on the first reset button in the "Suggested Transfers" table`, () => {
    suggestedTransfersTab.resetButton.firstClick();
});

Given(
    `user sees a {string} TransferAmount value in the "Suggested Transfers" table`,
    (value: string) => {
        suggestedTransfersTableRow.transferAmountRowText.contains(value);
    },
);

Given(`user sees a {string} Source value in the "Suggested Transfers" table`, (value: string) => {
    suggestedTransfersTableRow.sourceRowText.contains(value);
});

Given(
    `user sees a {string} Destination value in the "Suggested Transfers" table`,
    (value: string) => {
        suggestedTransfersTableRow.destinationRowText.contains(value);
    },
);

Given(
    `user sees a {string} AccountExchange value in the "Suggested Transfers" table`,
    (value: string) => {
        suggestedTransfersTableRow.accountRowText.contains(value);
    },
);

Given(/user (sees|not sees) warning icon in the "Suggested Transfers" table/, (value: string) => {
    switch (value) {
        case 'not sees':
            suggestedTransfersTableRow.warningIcon.checkNotExists();
            break;
        case 'sees':
            suggestedTransfersTableRow.warningIcon.checkExists();
            suggestedTransfersTableRow.warningIcon.checkVisible();
            break;
    }
});

Given(/user (sees|not sees) warning icon in the "Manual Transfer" tab/, (value: string) => {
    switch (value) {
        case 'not sees':
            manualTransferTab.warningIconButton.checkNotExists();
            break;
        case 'sees':
            manualTransferTab.warningIconButton.checkExists();
            manualTransferTab.warningIconButton.checkVisible();
            break;
    }
});

Given(`user sees the {string} tab in the "Balance Monitor" page`, (nameTab: string) => {
    switch (nameTab) {
        case 'Suggested Transfers':
            suggestedTransfersTab.checkVisibleTable();
            break;
        case 'Transfers History':
            transfersHistoryTab.checkVisibleTable();
            break;
        case 'Coin Transfer Details':
            coinTransferDetailsTab.checkVisibleTable();
            break;
        case 'Manual Transfer':
            manualTransferTab.checkVisibleTab();
            break;
        case 'Send data to analyse':
            sendDataToAnalyseTab.checkVisibleTab();
            break;
        case 'Distribution':
            distributionTab.checkVisibleTab();
            break;
        case 'Gathering':
            gatheringTab.checkVisibleTab();
            break;
        case 'Component Statuses':
            componentStatusesTab.checkVisibleTable();
            break;
    }
});

Given(`user sees data in the {string} table on the "Balance Monitor" page`, (nameTab: string) => {
    switch (nameTab) {
        case 'Suggested Transfers':
            suggestedTransfersTab.checkVisibleTable();
            suggestedTransfersTableRow.checkDataTable();
            break;
        case 'Transfers History':
            transfersHistoryTab.checkVisibleTable();
            transfersHistoryTableRow.checkDataTable();
            break;
        case 'Coin Transfer Details':
            coinTransferDetailsTab.coinTransferFilter.clickAndType('AAA');
            coinTransferDetailsTab.checkVisibleTable();
            coinsTransferDetailsTableRow.checkDataTable();
            break;
        case 'Component Statuses':
            componentStatusesTab.checkVisibleTable();
            componentStatusesTableRow.checkDataTable();
            break;
    }
});

Given(`user clicks the {string} button in the menu "Balance Monitor"`, (nameButton: string) => {
    switch (nameButton) {
        case 'Balance Monitor':
            balanceMonitorPage.balanceMonitorButton.click();
            break;
        case 'Internal Transfers':
            balanceMonitorPage.internalTransfersButton.click();
            break;
        case 'Transfer Blocking Rules':
            balanceMonitorPage.transferBlockingRulesButton.click();
            break;
        case 'Amount Limits Rules':
            balanceMonitorPage.amountLimitsRulesButton.click();
            break;
        case 'Auto Transfer Rules':
            balanceMonitorPage.autoTransferRules.click();
            break;
        case 'Component Statuses':
            balanceMonitorPage.componentStatusesButton.click();
            break;
    }
});

Given(`user sees the {string} page of the "Balance Monitor"`, (namePage: string) => {
    switch (namePage) {
        case 'Balance Monitor':
            balanceMonitorPage.checkVisiblePanel();
            checkUrlInclude(EPagesBalanceMonitorUrl.balanceMonitor);
            break;
        case 'Internal Transfers':
            internalTransfersPage.checkVisiblePanel();
            checkUrlInclude(EPagesBalanceMonitorUrl.internalTransfers);
            break;
        case 'Transfer Blocking Rules':
            transferBlockingRulesPage.checkVisiblePanel();
            checkUrlInclude(EPagesBalanceMonitorUrl.transferBlockingRules);
            break;
        case 'Amount Limits Rules':
            amountLimitsRulesPage.checkVisiblePanel();
            checkUrlInclude(EPagesBalanceMonitorUrl.amountLimitsRules);
            break;
        case 'Auto Transfer Rules':
            autoTransferRulesPage.checkVisiblePanel();
            checkUrlInclude(EPagesBalanceMonitorUrl.autoTransferRules);
            break;
    }
    customWait(1);
});

Given(`user goes to the {string} page in the "Balance Monitor"`, (namePage: string) => {
    switch (namePage) {
        case 'Balance Monitor':
            balanceMonitorPage.openPageServersByName('balanceMonitor');
            break;
        case 'Internal Transfers':
            balanceMonitorPage.openPageServersByName('internalTransfers');
            break;
        case 'Transfer Blocking Rules':
            balanceMonitorPage.openPageServersByName('transferBlockingRules');
            break;
        case 'Amount Limits Rules':
            balanceMonitorPage.openPageServersByName('amountLimitsRules');
            break;
        case 'Auto Transfer Rules':
            balanceMonitorPage.openPageServersByName('autoTransferRules');
            break;
    }
});

Given(
    `user goes to the {string} page in the "Balance Monitor" by {string} server params`,
    (namePage: string, nameServer: string) => {
        switch (namePage) {
            case 'Internal Transfers':
                balanceMonitorPage.openPageByBackendServerName('internalTransfers', nameServer);
                break;
            case 'Auto Transfer Rules':
                balanceMonitorPage.openPageByBackendServerName('autoTransferRules', nameServer);
                break;
        }
    },
);

Given(`user checks data in the "Transfer confirmation" modal`, () => {
    const data = getDataSuggestedTransfer();
    const propertiesToCheck = [
        'From',
        'To',
        'Amount',
        'Network',
        data.coin,
        data.source,
        data.destination,
    ];

    propertiesToCheck.forEach((property) => {
        confirmModal.confirmModal.checkContain(property);
    });
});

Given(`user sees data "Suggested Transfers" in the "Manual Transfer" tab`, () => {
    const data = getDataSuggestedTransfer();
    manualTransferTab.coinSelector.checkContain(data.coin);
    manualTransferTab.sourceSelector.checkContain(data.source);
    manualTransferTab.destinationSelector.checkContain(data.destination);
    manualTransferTab.availableSelector.checkHaveValue(data.available);
    manualTransferTab.amountInput.checkHaveValue(data.transferRoundAmount);
    manualTransferTab.percentInput.checkHavePlaceholder(data.account);
    manualTransferTab.sendButton.checkEnabled();
});

Given(
    `user selects the first task and selects in the context menu of {string} in the "Transfers History" tab`,
    (nameItem: string) => {
        transfersHistoryTableRow.firstRightClick();
        contextMenu.contextMenu.containsClick(nameItem);
    },
);

Given(
    `user selects the first task and selects in the context menu of {string} in the "Suggested Transfers" tab`,
    (nameItem: string) => {
        suggestedTransfersTableRow.firstRightClick();
        contextMenu.contextMenu.containsClick(nameItem);
    },
);

Given(
    `user selects the send task and selects in the context menu of {string} in the "Suggested Transfers" tab`,
    (nameItem: string) => {
        cy.contains(ETableHeaderSelectors.TableRowText, '99.8% / —').rightclick();
        contextMenu.contextMenu.containsClick(nameItem);
    },
);

Given(
    `user sees {string} {string} in the "Suggested Transfers" table`,
    (nameValue: string, nameRow: string) => {
        switch (nameRow) {
            case 'coin':
                suggestedTransfersTableRow.checkContainCoin(nameValue);
                break;
            case 'source':
                suggestedTransfersTableRow.checkContainSource(nameValue);
                break;
            case 'destination':
                suggestedTransfersTableRow.checkContainDestination(nameValue);
                break;
        }
    },
);

Given(
    `user sees {string} {string} in the "Transfers History" table`,
    (nameValue: string, nameRow: string) => {
        switch (nameRow) {
            case 'status':
                transfersHistoryTableRow.checkContainStatus(nameValue);
                break;
            case 'coin':
                transfersHistoryTableRow.checkContainCoin(nameValue);
                break;
            case 'source':
                transfersHistoryTableRow.checkContainSource(nameValue);
                break;
            case 'destination':
                transfersHistoryTableRow.checkContainDestination(nameValue);
                break;
            case 'amount':
                transfersHistoryTableRow.checkContainAmount(nameValue);
                break;
        }
    },
);

Given(
    `user sees {string} {string} in the "Coin Transfer Details" table`,
    (nameValue: string, nameRow: string) => {
        switch (nameRow) {
            case 'network':
                coinsTransferDetailsTableRow.checkContainNetwork(nameValue);
                break;
            case 'source':
                coinsTransferDetailsTableRow.checkContainSource(nameValue);
                break;
        }
    },
);

Given(
    `user sees {string} {string} in the "Component Statuses" table`,
    (nameRow: string, nameValue: string) => {
        switch (nameRow) {
            case 'ComponentID':
                componentStatusesTableRow.checkContainComponentID(nameValue);
                break;
            case 'Description':
                componentStatusesTableRow.checkContainDescription(nameValue);
                break;
        }
    },
);

Given(/user (sees|not sees) data on the "Manual Transfer" form/, (checkContain: string) => {
    const data = getDataManualTransfer();
    switch (checkContain) {
        case 'sees':
            manualTransferTab.coinSelector.contains(data.coin);
            manualTransferTab.sourceSelector.contains(data.source);
            manualTransferTab.destinationSelector.contains(data.destination);
            manualTransferTab.availableSelector.checkHaveValue(data.available);
            manualTransferTab.amountInput.checkHaveValue(data.amount);
            manualTransferTab.percentInput.checkHavePlaceholder(data.percent);
            break;
        case 'not see':
            manualTransferTab.coinSelector.checkNotContain(data.coin);
            manualTransferTab.sourceSelector.checkNotContain(data.source);
            manualTransferTab.destinationSelector.checkNotContain(data.destination);
            manualTransferTab.availableSelector.checkNotContain(data.available);
            manualTransferTab.amountInput.checkNotContain(data.amount);
            manualTransferTab.percentInput.checkNotContain(data.percent);
            break;
    }
});

Given(`user not sees data on the "Send data to analyse" form`, (dataTable: DataTable) => {
    dataTable.hashes().forEach((element) => {
        const propertiesToCheck = ['coin', 'comment'];

        propertiesToCheck.forEach((property) => {
            sendDataToAnalyseTab.sendDataTab.checkNotContain(element[property]);
        });
    });
});

Given(`user sees the selected coin {string} in the "Distribution" tab`, (nameCoin: string) => {
    distributionTab.coinSelector.checkContain(nameCoin);
});

Given(`user sees that {string} fields is disabled`, (nameField: string) => {
    switch (nameField) {
        case 'coin':
            manualTransferTab.coinSelector.checkNotEnabled();
            manualTransferTab.availableSelector.checkNotEnabled();
            break;
        case 'account':
            manualTransferTab.sourceSelector.checkNotEnabled();
            manualTransferTab.destinationSelector.checkNotEnabled();
            break;
    }
    manualTransferTab.amountInput.checkEnabled();
    manualTransferTab.percentInput.checkEnabled();
});

Given(
    `user selects the {string} coin in the {string} table`,
    (nameCoin: string, nameTable: string) => {
        switch (nameTable) {
            case 'Suggested Transfers':
                suggestedTransfersTableRow.coinRowText.firstContainsClick(nameCoin);
                break;
            case 'Transfers History':
                transfersHistoryTableRow.coinRowText.firstContainsClick(nameCoin);
                break;
            case 'Coin Transfer Details':
                coinTransferDetailsTab.coinTransferFilter.clickAndType(nameCoin);
                coinsTransferDetailsTableRow.coinRowText.firstContainsClick(nameCoin);
                break;
        }
    },
);

Given(`user select the {string} coin in the collection`, (nameCoin: string) => {
    gatheringTab.coinSelector.clickAndType(nameCoin);
});

Given(`user sees active {string} button in the "Gathering" form`, (nameButton: string) => {
    switch (nameButton) {
        case 'Stop collecting':
            gatheringTab.stopCollectingButton.checkEnabled();
            break;
        case 'Collect':
            gatheringTab.collectButton.checkEnabled();
            break;
    }
});

Given(`user sees not active {string} button in the "Gathering" form`, (nameButton: string) => {
    switch (nameButton) {
        case 'Stop collecting':
            gatheringTab.stopCollectingButton.checkNotEnabled();
            break;
        case 'Collect':
            gatheringTab.collectButton.checkNotEnabled();
            break;
    }
});

Given(`user sees that the collection button contains the {string} coin`, (nameCoin: string) => {
    gatheringTab.collectButton.contains(nameCoin);
});

Given(`user clicks a {string} button in the "Gathering" form`, (nameButton: string) => {
    switch (nameButton) {
        case 'Stop collecting':
            gatheringTab.stopCollectingButton.click();
            break;
        case 'Collect':
            gatheringTab.collectButton.click();
            break;
        case 'Clear':
            gatheringTab.clearButton.click();
            break;
    }
});

Given(`user selects gathering type values:`, (dataTable: DataTable) => {
    dataTable.hashes().forEach((element) => {
        gatheringTab.coinSelector.clickAndType(element.coin);
        gatheringTab.amountInput.type(element.amount);
    });
});

Given(/user (sees|not sees) data on the "Gathering" form/, (checkContain: string) => {
    const data = getDataGathering();
    switch (checkContain) {
        case 'sees':
            gatheringTab.exchangeSelector.contains(data.exchange);
            gatheringTab.coinSelector.contains(data.coin);
            gatheringTab.availableInput.checkHaveValue(data.available);
            gatheringTab.amountInput.checkHaveValue(data.amount);
            gatheringTab.percentInput.checkHavePlaceholder(data.percent);
            break;
        case 'not see':
            gatheringTab.exchangeSelector.checkNotContain(data.exchange);
            gatheringTab.coinSelector.checkNotContain(data.coin);
            gatheringTab.availableInput.checkNotContain(data.available);
            gatheringTab.amountInput.checkNotContain(data.amount);
            gatheringTab.percentInput.checkNotContain(data.percent);
            break;
    }
});

Given(
    `user sees a new transfer sent via {string} tab in the "Transfers History" table`,
    (nameTab: string) => {
        let data;
        switch (nameTab) {
            case 'Manual Transfer':
                data = getDataManualTransfer();
                break;
            case 'Suggested Transfers':
                customWait(3);
                data = getDataSuggestedTransfer();
                break;
        }
        transfersHistoryTableRow.createsRowText.firstContains(dateChange(ETime.Now));
        transfersHistoryTableRow.updateTimeRowText.firstContains(dateChange(ETime.Now));

        const propertiesToCheck = ['coin', 'source', 'destination', 'amount', 'creationMode'];
        for (const row of propertiesToCheck) {
            transfersHistoryTableRow[`${row}RowText`].firstContains(data[row]);
        }
    },
);
