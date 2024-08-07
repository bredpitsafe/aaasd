import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { backtestingPage } from '../../../../../../lib/page-objects/backtesting/backtesting.page';
import { runsTab } from '../../../../../../lib/page-objects/backtesting/components/runs-tab/runs.tab';
import { runsTabTableRow } from '../../../../../../lib/page-objects/backtesting/components/runs-tab/runs.tab.table.row';
import { NoRowsToShow } from '../../../../../../lib/page-objects/common/table/table.header';
import { getDataTaskTwoRun } from '../../../../../data/backtesting/getDataTaskTwoRun';

Given(`user sees the "Indicator name" of the task`, () => {
    runsTab.scoreIndicatorSearchInput.checkHaveValue('ScoreIndicator');
});

Given(`user types {string} indicator in the "Indicator name" input`, (nameIndicator: string) => {
    backtestingPage.mainTitleText.checkNotContain('Loading');
    runsTab.clearScoreIndicator();
    runsTab.setScoreName(nameIndicator);
});

Given(
    `user types {string} in the "Score indicator name" input in the "Runs" tab`,
    (nameIndicator: string) => {
        runsTab.runsTab.checkNotContain(NoRowsToShow);
        runsTab.deleteScoreIndicatorButton.click();
        const namesIndicators = nameIndicator.split(',');
        runsTab.setTwoScoreName(namesIndicators);
    },
);

Given(`user sees value {string} indicator in the "Runs" tab`, (nameIndicator) => {
    switch (nameIndicator) {
        case 'accountant.HB.backtestAccount.ADA':
        case 'accountant.HB.backtestAccount.USDT':
            runsTabTableRow.scoreRowText.contains('10000000000');
            break;
        case 'adausdt|HuobiSpot.l1.bid':
            runsTabTableRow.scoreRowText.contains('0.362446');
            break;
        case 'adausdt|HuobiSpot.l1.ask':
            runsTabTableRow.scoreRowText.contains('0.362481');
            break;
    }
});

Given(`user checks visibility of the context menu of the run`, () => {
    runsTabTableRow.checkVisibleContextMenu();
});

Given(`user sees the {string} status in the "Runs" tab`, (nameStatus: string) => {
    runsTabTableRow.checkStatusRun(nameStatus);
});

Given(
    `user sees the {string} status of the "Runs" tab for {string} run`,
    (nameStatus: string, nameRun: string) => {
        runsTabTableRow.checkStatusRun(nameStatus, nameRun);
    },
);

Given(`user selects the {string} run on the "Runs" tab`, (nameRun: string) => {
    const data = getDataTaskTwoRun();
    switch (nameRun) {
        case 'first':
            runsTabTableRow.simEndTimeRowText.containsClick(data.simEndTimes[0]);
            break;
        case 'second':
            runsTabTableRow.simEndTimeRowText.containsClick(data.simEndTimes[1]);
            break;
    }
});
