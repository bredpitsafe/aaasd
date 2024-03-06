import { DataTable, Given } from '@badeball/cypress-cucumber-preprocessor';

import { EPagesTradingStatsUrl } from '../../../../lib/interfaces/trading-stats/page-interfaces';
import { filtersModal } from '../../../../lib/page-objects/common/filter.modal';
import { tableHeader } from '../../../../lib/page-objects/common/table/table.header';
import { ETime } from '../../../../lib/page-objects/common/time';
import { arbTableRow } from '../../../../lib/page-objects/trading-stats/daily-page/arb.table.row';
import { pnlTableRow } from '../../../../lib/page-objects/trading-stats/daily-page/pnl.table.row';
import { tradesTableRow } from '../../../../lib/page-objects/trading-stats/daily-page/trades.table.row';
import { monthlyStatsTableRow } from '../../../../lib/page-objects/trading-stats/monthly-page/monthly-stats.table.row';
import { tradingStatsPage } from '../../../../lib/page-objects/trading-stats/trading-stats.page';
import { customWait } from '../../../../lib/web-socket/server';
import { checkUrlInclude } from '../../../asserts/comon-url-assert';
import { getDateOnly, getFirstDayOfMonth, getLastDayOfMonth } from '../../../data/date';

Given(`user sees the {string} page of the "Trading Stats"`, (namePage: string) => {
    tradingStatsPage.checkVisibleFilter(namePage);
    switch (namePage) {
        case 'Daily':
            tradingStatsPage.checkDailyVisibleTable();
            checkUrlInclude(EPagesTradingStatsUrl.daily);
            break;
        case 'Monthly':
            tradingStatsPage.checkMonthlyVisibleTable();
            checkUrlInclude(EPagesTradingStatsUrl.monthly);
            break;
    }
    customWait(1);
});

Given(`user clicks the "Daily" button`, () => {
    tradingStatsPage.dailyStatsButton.click();
});

Given(`user clicks the "Monthly" button`, () => {
    tradingStatsPage.monthlyStatsButton.click();
});

Given(`user sees the filters in the {string} page`, (namePage: string) => {
    switch (namePage) {
        case 'Daily':
            tradingStatsPage.checkDailyVisibleTable();
            filtersModal.dayCalendarInput.checkVisible();
            break;
        case 'Monthly':
            tradingStatsPage.checkMonthlyVisibleTable();
            filtersModal.startDateCalendarInput.checkVisible();
            filtersModal.endDateCalendarInput.checkVisible();
            break;
    }
    filtersModal.checkVisiblyFilter();
    filtersModal.checkVisiblyIncludeFilter();
    tradingStatsPage.filterModal.containsClick('Exclude');
    filtersModal.checkVisiblyExcludeFilter();
});

Given(`user goes on the {string} page in the "Trading Stats"`, (namePage: string) => {
    tradingStatsPage.openPageServersByName(namePage);
});

function setDateMonthly(dateRange) {
    const arr = dateRange.split(' - ');
    const fromDate = arr[0];
    const toDate = arr[1];
    return `?to=${toDate}&from=${fromDate}`;
}

function setDateDaily(date) {
    return `?date=${date}`;
}

Given(`user goes on the {string} date the {string} page`, (date: string, namePage: string) => {
    switch (namePage) {
        case 'Daily':
            tradingStatsPage.openPageServersByDate(setDateDaily(date), namePage);
            break;
        case 'Monthly':
            tradingStatsPage.openPageServersByDate(setDateMonthly(date), namePage);
            break;
    }
    tableHeader.loadingRowText.checkNotExists();
    customWait(1);
});

Given(`user types in the general filter values`, (dataTable: DataTable) => {
    customWait(1);
    dataTable.hashes().forEach((element) => {
        filtersModal.backtestingIdInput.type(element.backtestingIdValue);
    });
});

Given(`user sets {string} in the "Backtesting ID" filter`, (backtestingId: string) => {
    customWait(1);
    filtersModal.backtestingIdInput.type(backtestingId);
    filtersModal.applyButton.click();
});

Given(`user selects "Exclude" filter`, () => {
    tradingStatsPage.filterModal.containsClick('Exclude');
});

Given(
    `user sets {string} "Strategies" in the {string} filter`,
    (nameStrategy: string, nameFilters: string) => {
        switch (nameFilters) {
            case 'Include':
                filtersModal.strategiesIncludeSelector.typeAndClickByText(nameStrategy);
                break;
            case 'Exclude':
                tradingStatsPage.filterModal.containsClick('Exclude');
                filtersModal.strategiesExcludeSelector.typeAndClickByText(nameStrategy);
                break;
        }
        filtersModal.applyButton.click();
        customWait(1);
    },
);

Given(
    `user sets {string} "Base Assets" in the {string} filter`,
    (nameAsset: string, nameFilters: string) => {
        switch (nameFilters) {
            case 'Include':
                filtersModal.baseAssetsIncludeSelector.typeAndClickByText(nameAsset);
                break;
            case 'Exclude':
                tradingStatsPage.filterModal.containsClick('Exclude');
                filtersModal.baseAssetsExcludeSelector.typeAndClickByText(nameAsset);
                break;
        }
        filtersModal.applyButton.click();
        customWait(1);
    },
);

Given(
    `user sets {string} "Quote Assets" in the {string} filter`,
    (nameAsset: string, nameFilters: string) => {
        switch (nameFilters) {
            case 'Include':
                filtersModal.quoteAssetsIncludeSelector.typeAndClickByText(nameAsset);
                break;
            case 'Exclude':
                tradingStatsPage.filterModal.containsClick('Exclude');
                filtersModal.quoteAssetsExcludeSelector.typeAndClickByText(nameAsset);
                break;
        }
        filtersModal.applyButton.click();
        customWait(1);
    },
);

Given(
    `user sets {string} "Any Assets" in the {string} filter`,
    (nameAsset: string, nameFilters: string) => {
        switch (nameFilters) {
            case 'Include':
                filtersModal.anyAssetsIncludeSelector.typeAndClickByText(nameAsset);
                break;
            case 'Exclude':
                tradingStatsPage.filterModal.containsClick('Exclude');
                filtersModal.anyAssetsExcludeSelector.typeAndClickByText(nameAsset);
                break;
        }
        filtersModal.applyButton.click();
        customWait(1);
    },
);

Given(
    `user sets {string} "Exchanges" in the {string} filter`,
    (nameExchange: string, nameFilters: string) => {
        switch (nameFilters) {
            case 'Include':
                filtersModal.exchangesIncludeSelector.typeAndClickByText(nameExchange);
                break;
            case 'Exclude':
                tradingStatsPage.filterModal.containsClick('Exclude');
                filtersModal.exchangesExcludeSelector.typeAndClickByText(nameExchange);
                break;
        }
        filtersModal.applyButton.click();
        customWait(1);
    },
);
Given(
    `user sets {string} "Instruments" in the {string} filter`,
    (nameExchange: string, nameFilters: string) => {
        switch (nameFilters) {
            case 'Include':
                filtersModal.instrumentsIncludeSelector.typeAndClickByText(nameExchange);
                break;
            case 'Exclude':
                tradingStatsPage.filterModal.containsClick('Exclude');
                filtersModal.instrumentsExcludeSelector.typeAndClickByText(nameExchange);
                break;
        }
        filtersModal.applyButton.click();
        customWait(1);
    },
);

Given(`user types in the {string} filter values`, (nameFilters: string, dataTable: DataTable) => {
    dataTable.hashes().forEach((element) => {
        switch (nameFilters) {
            case 'Include':
                filtersModal.strategiesIncludeSelector.typeAndClickByText(element.strategies);
                filtersModal.baseAssetsIncludeSelector.typeAndClickByText(element.baseAssetsType);
                filtersModal.quoteAssetsIncludeSelector.typeAndClickByText(element.quoteAssetsType);
                filtersModal.anyAssetsIncludeSelector.typeAndClickByText(element.anyAssetsType);
                filtersModal.exchangesIncludeSelector.typeAndClickByText(element.exchangesType);
                break;
            case 'Exclude':
                tradingStatsPage.filterModal.containsClick('Exclude');
                filtersModal.strategiesExcludeSelector.typeAndClickByText(element.strategies);
                filtersModal.baseAssetsExcludeSelector.typeAndClickByText(element.baseAssetsType);
                filtersModal.quoteAssetsExcludeSelector.typeAndClickByText(element.quoteAssetsType);
                filtersModal.anyAssetsExcludeSelector.typeAndClickByText(element.anyAssetsType);
                filtersModal.exchangesExcludeSelector.typeAndClickByText(element.exchangesType);
                break;
        }
    });
});

Given(
    `user types in the {string} instruments values in {string} selector`,
    (nameInstrument: string, nameFilters: string) => {
        switch (nameFilters) {
            case 'Include':
                filtersModal.instrumentsIncludeSelector.typeAndClickByText(nameInstrument);
                break;
            case 'Exclude':
                filtersModal.instrumentsExcludeSelector.typeAndClickByText(nameInstrument);
                break;
        }
    },
);

Given(`user clicks {string} button`, (nameButton: string) => {
    switch (nameButton) {
        case 'Apply':
            filtersModal.applyButton.click();
            break;
        case 'Reset':
            filtersModal.resetButton.click();
            break;
    }
    customWait(1);
});

Given(`user sees the {string} calendar`, (nameButton: string) => {
    switch (nameButton) {
        case 'Daily':
            filtersModal.previousDayButton.checkVisible();
            filtersModal.previousDayButton.checkEnabled();
            filtersModal.nextDayButton.checkVisible();
            filtersModal.nextDayButton.checkNotEnabled();
            break;
        case 'Monthly':
            filtersModal.previousMonthButton.checkVisible();
            filtersModal.previousMonthButton.checkEnabled();
            filtersModal.nextMonthButton.checkVisible();
            filtersModal.nextMonthButton.checkNotEnabled();
            break;
    }
});

Given(`user types {string} date in the "Daily" calendar`, (date: string) => {
    filtersModal.setDateInDayCalendar(date);
    filtersModal.applyButton.click();
});

Given(
    `user types {string} and {string} date in the "Monthly" calendar`,
    (startDate: string, endDate: string) => {
        filtersModal.setDateInMonthlyCalendar(startDate, endDate);
        filtersModal.applyButton.click();
    },
);

Given(`user sees {string} date in the URL page`, (date: string) => {
    checkUrlInclude(date);
});

Given(`user clicks {string} daily button`, (nameButton: string) => {
    switch (nameButton) {
        case 'Next':
            filtersModal.nextDayButton.click();
            break;
        case 'Previous':
            filtersModal.previousDayButton.click();
            break;
    }
});

Given(`user clicks {string} monthly button`, (nameButton: string) => {
    switch (nameButton) {
        case 'Next':
            filtersModal.nextMonthButton.click();
            break;
        case 'Previous':
            filtersModal.previousMonthButton.click();
            break;
    }
    filtersModal.applyButton.checkNotEnabled();
});

Given(`user sees {string} date in the "Monthly" calendar`, (date: string) => {
    switch (date) {
        case 'Today`s':
            filtersModal.startDateCalendarInput.get().should('have.value', getFirstDayOfMonth());
            filtersModal.endDateCalendarInput.get().should('have.value', getDateOnly(ETime.Now));
            break;
        case 'Previous':
            filtersModal.startDateCalendarInput.get().should('have.value', getFirstDayOfMonth(-1));
            filtersModal.endDateCalendarInput.get().should('have.value', getLastDayOfMonth(-1));
            break;
        case 'Next':
            filtersModal.startDateCalendarInput.get().should('have.value', getFirstDayOfMonth());
            filtersModal.endDateCalendarInput.get().should('have.value', getDateOnly(ETime.Now));
            break;
    }
});

Given(`user sees {string} date in the "Daily" calendar`, (date: string) => {
    switch (date) {
        case 'Today`s':
            filtersModal.dayCalendarInput.get().should('have.value', getDateOnly(ETime.Now));
            break;
        case 'Next':
            filtersModal.dayCalendarInput.get().should('have.value', getDateOnly(ETime.Now));
            break;
        case 'Previous':
            filtersModal.dayCalendarInput.get().should('have.value', getDateOnly(ETime.Day));
            break;
    }
});

Given(
    /user (sees|not sees) the typed values in the filters/,
    (value: string, dataTable: DataTable) => {
        dataTable.hashes().forEach((element) => {
            const filterElements = [
                element.strategies,
                element.baseAssetsType,
                element.quoteAssetsType,
                element.anyAssetsType,
                element.exchangesType,
                element.instrumentsType,
            ];
            switch (value) {
                case 'sees':
                    for (const elem of filterElements) {
                        tradingStatsPage.filterModal.checkContain(elem);
                    }
                    break;
                case 'not sees':
                    for (const elem of filterElements) {
                        tradingStatsPage.filterModal.checkNotContain(elem);
                    }
                    break;
            }
        });
        customWait(1);
    },
);

Given(`user sees value in the {string} table`, (nameTable: string) => {
    switch (nameTable) {
        case 'PNL':
            pnlTableRow.checkDataInPNLTable();
            break;
        case 'ARB':
            arbTableRow.checkDataInARBTable();
            break;
        case 'Trades':
            tradesTableRow.checkDataInTradesTable();
            break;
        case 'Profits':
            monthlyStatsTableRow.checkDataInProfitsTable();
            break;
        case 'ARB Volume':
        case 'ARB Maker':
        case 'ARB Taker':
        case 'ARB Fees':
            monthlyStatsTableRow.checkDataInMonthlyStatsTable(nameTable);
            break;
    }
});

Given(`user sees data for {string} in the "Profits" table`, (nameMonth: string) => {
    monthlyStatsTableRow.checkDataMonthInProfitsTable(nameMonth);
});

Given(`user opens the {string} table`, (nameTable: string) => {
    tradingStatsPage.closeButton.get().each(($element) => {
        cy.wrap($element).click();
    });
    tradingStatsPage.openTabTable(nameTable);
});

Given(`user sees {string} "Strategies" in the "PNL", "ARB" tables`, (strategy: string) => {
    const strategyList = strategy.split(',');
    pnlTableRow.checkContainStrategy(strategyList);
    arbTableRow.checkContainStrategy(strategyList);
});

Given(`user sees {string} "Strategies" in the "Trades" table`, (strategy: string) => {
    const strategyList = strategy.split(',');
    tableHeader.loadingRowText.checkNotExists();
    tradesTableRow.checkContainStrategy(strategyList);
});

Given(`user sees {string} "Strategies" in the "Monthly Stats" table`, (strategy: string) => {
    const strategyList = strategy.split(',');
    monthlyStatsTableRow.checkContainStrategy(strategyList);
});

Given(`user sees {string} "Base Assets" in the "Trades" table`, (asset: string) => {
    const assetsList = asset.split(',');
    tableHeader.loadingRowText.checkNotExists();
    tradesTableRow.checkContainBaseAsset(assetsList);
});

Given(`user sees {string} "Quote Assets" in the "Trades" table`, (asset: string) => {
    const assetsList = asset.split(',');
    tableHeader.loadingRowText.checkNotExists();
    tradesTableRow.checkContainQuoteAsset(assetsList);
});

Given(`user sees {string} "Exchanges" in the "Trades" table`, (exchange: string) => {
    const exchangesList = exchange.split(',');
    tableHeader.loadingRowText.checkNotExists();
    tradesTableRow.checkContainExchanges(exchangesList);
});

Given(`user sees {string} "Instruments" in the "Trades" table`, (instrument: string) => {
    const instrumentsList = instrument.split(',');
    tableHeader.loadingRowText.checkNotExists();
    tradesTableRow.checkContainInstruments(instrumentsList);
});

Given(`user not sees {string} "Strategies" in the "PNL", "ARB" tables`, (strategy: string) => {
    const strategyList = strategy.split(',');
    pnlTableRow.checkNotContainStrategy(strategyList);
    arbTableRow.checkNotContainStrategy(strategyList);
});

Given(`user not sees {string} "Strategies" in the "Trades" table`, (strategy: string) => {
    const strategyList = strategy.split(',');
    tableHeader.loadingRowText.checkNotExists();
    tradesTableRow.checkNotContainStrategy(strategyList);
});

Given(`user not sees {string} "Strategies" in the "Monthly Stats" table`, (strategy: string) => {
    const strategyList = strategy.split(',');
    monthlyStatsTableRow.checkNotContainStrategy(strategyList);
});

Given(`user not sees {string} "Base Assets" in the "Trades" table`, (asset: string) => {
    const assetsList = asset.split(',');
    tableHeader.loadingRowText.checkNotExists();
    tradesTableRow.checkNotContainBaseAsset(assetsList);
});

Given(`user not sees {string} "Quote Assets" in the "Trades" table`, (asset: string) => {
    const assetsList = asset.split(',');
    tableHeader.loadingRowText.checkNotExists();
    tradesTableRow.checkNotContainQuoteAsset(assetsList);
});

Given(`user not sees {string} "Exchanges" in the "Trades" table`, (exchange: string) => {
    const exchangesList = exchange.split(',');
    tableHeader.loadingRowText.checkNotExists();
    tradesTableRow.checkNotContainExchanges(exchangesList);
});

Given(`user not sees {string} "Instruments" in the "Trades" table`, (instrument: string) => {
    const instrumentsList = instrument.split(',');
    tableHeader.loadingRowText.checkNotExists();
    tradesTableRow.checkNotContainInstruments(instrumentsList);
});
