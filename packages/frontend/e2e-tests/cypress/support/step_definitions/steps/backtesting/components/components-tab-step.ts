import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { backtestingPage } from '../../../../../lib/page-objects/backtesting/backtesting.page';
import { configsTab } from '../../../../../lib/page-objects/backtesting/components/configs-tab/configs.tab';
import { runsInfoTab } from '../../../../../lib/page-objects/backtesting/components/runs-info-tab/runs-info.tab';
import { runsInfoTabTableRow } from '../../../../../lib/page-objects/backtesting/components/runs-info-tab/runs-info.tab.table.row';
import { runsTab } from '../../../../../lib/page-objects/backtesting/components/runs-tab/runs.tab';
import { runsTabTableRow } from '../../../../../lib/page-objects/backtesting/components/runs-tab/runs.tab.table.row';
import { tasksTab } from '../../../../../lib/page-objects/backtesting/components/tasks-tab/tasks.tab';
import { tasksTabTableRow } from '../../../../../lib/page-objects/backtesting/components/tasks-tab/tasks.tab.table.row';
import { productLogsTab } from '../../../../../lib/page-objects/common/components/product-logs-tab/product-logs.tab';
import { productLogsTableRow } from '../../../../../lib/page-objects/common/components/product-logs-tab/product-logs.table.row';
import { ETab } from '../../../../../lib/page-objects/common/tab';
import {
    NoRowsToShow,
    tableHeader,
} from '../../../../../lib/page-objects/common/table/table.header';
import { indicatorsTab } from '../../../../../lib/page-objects/trading-servers-manager/components/indicators-tab/indicators.tab';
import { getDataTaskTwoRun } from '../../../../data/backtesting/getDataTaskTwoRun';
const data = getDataTaskTwoRun();

Given(`user selects the {string} tab on the "Backtesting" page`, (nameTap: string) => {
    switch (nameTap) {
        case ETab.productLogs:
            backtestingPage.selectBacktestingTab(nameTap);
            tableHeader.checkNotVisibleLoad();
            productLogsTab.checkElementsExists();
            break;
        case ETab.runs:
            backtestingPage.selectBacktestingTab(nameTap);
            tableHeader.checkNotVisibleLoad();
            runsTab.checkVisibleTable();
            break;
        case ETab.runsInfo:
            backtestingPage.selectBacktestingTab(nameTap);
            tableHeader.checkNotVisibleLoad();
            runsInfoTab.checkVisibleTable();
            break;
        case ETab.configs:
            backtestingPage.selectBacktestingTab(nameTap);
            configsTab.checkVisibleTab();
            break;
        case ETab.indicators:
            backtestingPage.selectBacktestingTab(nameTap);
            tableHeader.checkNotVisibleLoad();
            indicatorsTab.checkVisibleTable();
            break;
    }
});

Given(`user sees {string} tab on the "Backtesting" page`, (nameTap: string) => {
    switch (nameTap) {
        case ETab.tasks:
            tasksTab.checkVisibleTable();
            break;
        case ETab.runs:
            runsTab.checkVisibleTable();
            break;
    }
});

Given(`user sees the data of two runs on the {string} tab`, (nameTap: string) => {
    const data = getDataTaskTwoRun();
    switch (nameTap) {
        case ETab.runsInfo:
            runsInfoTabTableRow.checkRunsInfoData(data);
            break;
        case ETab.runs:
            runsTabTableRow.checkRunsData(data);
            break;
        case ETab.tasks:
            tasksTabTableRow.checkTwoRunTaskData();
            break;
    }
});

Given(`user sees the data {string} run on the "Configs" tab`, (nameRun: string) => {
    switch (nameRun) {
        case 'first':
            configsTab.checkRobotConfigByIndex(data, 0);
            break;
        case 'second':
            configsTab.checkRobotConfigByIndex(data, 1);
            break;
    }
});

Given(`user sees the data {string} run in the "Product Logs" tab`, (nameRun: string) => {
    switch (nameRun) {
        case 'first':
            productLogsTab.checkDateInCalendarByIndex(data, 0);
            productLogsTableRow.checkDateRunByIndex(data, 0);
            break;
        case 'second':
            productLogsTab.checkDateInCalendarByIndex(data, 1);
            productLogsTableRow.checkDateRunByIndex(data, 1);
            break;
    }
});

Given(`user sees value {string} indicator in the "Runs Info" tab`, (nameIndicator) => {
    switch (nameIndicator) {
        case 'adausdt|HuobiSpot.l1.ask':
            runsInfoTabTableRow.scoreRowText.contains('0.362481');
            break;
        case 'ETHBTC|BinanceSpot.l1.ask':
            runsInfoTabTableRow.scoreRowText.contains('0.069841');
            break;
    }
});

Given(
    `user types {string} in the "Score indicator names" input in the "Runs" tab`,
    (nameIndicator: string) => {
        runsInfoTab.runsInfoTab.checkNotContain(NoRowsToShow);
        runsInfoTab.deleteScoreIndicatorButton.click();
        const namesIndicators = nameIndicator.split(',');
        runsInfoTab.setTwoScoreName(namesIndicators);
    },
);
