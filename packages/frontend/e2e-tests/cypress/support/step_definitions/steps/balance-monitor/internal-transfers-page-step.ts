import { DataTable, Given } from '@badeball/cypress-cucumber-preprocessor';

import { internalTransfersTab } from '../../../../lib/page-objects/balance-monitor/components/internal-transfers/internal-transfers.tab';
import { internalTransfersHistoryTab } from '../../../../lib/page-objects/balance-monitor/components/internal-transfers-history/internal-transfers-history.tab';
import { internalTransfersHistoryTableRow } from '../../../../lib/page-objects/balance-monitor/components/internal-transfers-history/internal-transfers-history.table.row';
import { ETime } from '../../../../lib/page-objects/common/time';
import { customWait } from '../../../../lib/web-socket/server';
import { getDataInternalTransfers } from '../../../data/balance-monitor/getDataInternalTranfrefs';
import { getDataInternalTransfersHistory } from '../../../data/balance-monitor/getDataInternalTransfersHistory';
import { dateChange } from '../../../data/date';

Given(`user sees the {string} tab in the "Internal Transfers" page`, (nameTab: string) => {
    switch (nameTab) {
        case 'Internal Transfers':
            internalTransfersTab.checkVisibleTab();
            internalTransfersTab.checkElementExist();
            break;
        case 'Internal Transfers History':
            internalTransfersHistoryTab.checkVisibleTable();
            break;
    }
});

Given(/user (sees|not sees) data on the "Internal Transfers" form/, (checkContain: string) => {
    const data = getDataInternalTransfers();
    switch (checkContain) {
        case 'sees':
            internalTransfersTab.accountSelector.contains(data.account);
            internalTransfersTab.fromToSelector.contains(data.from);
            internalTransfersTab.fromToSectionSelector.contains(data.fromSection);
            internalTransfersTab.fromToSelector.contains(data.to);
            internalTransfersTab.fromToSectionSelector.contains(data.toSection);
            internalTransfersTab.coinSelector.contains(data.coin);
            internalTransfersTab.amountInput.checkHaveValue(data.amount);
            break;
        case 'not sees':
            internalTransfersTab.accountSelector.checkNotContain(data.account);
            internalTransfersTab.fromToSelector.checkNotContain(data.from);
            internalTransfersTab.fromToSectionSelector.checkNotContain(data.fromSection);
            internalTransfersTab.fromToSelector.checkNotContain(data.to);
            internalTransfersTab.fromToSectionSelector.checkNotContain(data.toSection);
            internalTransfersTab.coinSelector.checkNotContain(data.coin);
            internalTransfersTab.amountInput.checkNotContain(data.amount);
            break;
    }
});

Given(`user selects internal transfer type values:`, (dataTable: DataTable) => {
    dataTable.hashes().forEach((element) => {
        internalTransfersTab.accountSelector.clickTypeTextAndEnter(element.account);
        internalTransfersTab.fromToSelector.clickTypeTextAndEnterFirst(element.from);
        internalTransfersTab.fromToSectionSelector.clickTypeTextAndEnterFirst(element.fromSection);
        internalTransfersTab.fromToSelector.clickTypeTextAndEnter(element.to);
        internalTransfersTab.fromToSectionSelector.clickTypeTextAndEnter(element.toSection);
        internalTransfersTab.coinSelector.clickTypeTextAndEnter(element.coin);
        internalTransfersTab.amountInput.type(element.amount);
    });
});

Given(`user sees active "Send" button in the "Internal Transfers" form`, () => {
    internalTransfersTab.sendButton.checkEnabled();
});

Given(`user sees not active "Send" button in the "Internal Transfers" form`, () => {
    internalTransfersTab.sendButton.checkNotEnabled();
});

Given(`user sees that "Coin" selector has set value {string}`, (nameCoin: string) => {
    internalTransfersTab.coinSelector.clickTypeTextAndEnter(nameCoin);
    internalTransfersTab.coinSelector.checkContain(nameCoin);
});

Given(`user sees not that "Coin" selector has set value {string}`, (nameCoin: string) => {
    internalTransfersTab.coinSelector.checkNotContain(nameCoin);
});

Given(`user clicks a {string} button in the "Internal Transfers" form`, (nameButton) => {
    switch (nameButton) {
        case 'Clear':
            internalTransfersTab.clearButton.checkEnabled();
            internalTransfersTab.clearButton.click();
            break;
        case 'Send':
            internalTransfersTab.sendButton.checkEnabled();
            internalTransfersTab.sendButton.click();
            break;
        case 'Show low balances switch':
            internalTransfersTab.balancesSwitch.checkEnabled();
            internalTransfersTab.balancesSwitch.click();
            break;
    }
});

Given(`user sees new create transfer in the "Internal Transfers History" table`, () => {
    customWait(2);
    const data = getDataInternalTransfersHistory();
    internalTransfersHistoryTableRow.createsRowText.firstContains(dateChange(ETime.Now));

    const propertiesToCheck = ['coin', 'mainAccount', 'source', 'destination', 'amount'];
    for (const row of propertiesToCheck) {
        internalTransfersHistoryTableRow[`${row}RowText`].firstContains(data[row]);
    }
});

Given(
    `user sees {string} {string} in the "Internal Transfers History" table`,
    (nameValue: string, nameRow: string) => {
        switch (nameRow) {
            case 'status':
                internalTransfersHistoryTableRow.checkContainStatus(nameValue);
                break;
            case 'coin':
                internalTransfersHistoryTableRow.checkContainCoin(nameValue);
                break;
            case 'source':
                internalTransfersHistoryTableRow.checkContainSource(nameValue);
                break;
            case 'amount':
                internalTransfersHistoryTableRow.checkContainAmount(nameValue);
                break;
        }
    },
);
