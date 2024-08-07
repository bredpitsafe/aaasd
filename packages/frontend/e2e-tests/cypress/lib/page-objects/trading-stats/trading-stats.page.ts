import { testSelector } from '@frontend/common/e2e';
import { EMainMenuModalSelectors } from '@frontend/common/e2e/selectors/main-menu.modal.selectors';
import { ETradingStatsSelectors } from '@frontend/common/e2e/selectors/trading-stats/trading-stats.page.selectors';

import { getBackendServerUrl } from '../../../support/asserts/comon-url-assert';
import { BasePage } from '../../base.page';
import { Button } from '../../base/elements/button';
import { Input } from '../../base/elements/input';
import { Text } from '../../base/elements/text';
import { EPagesUrl } from '../../interfaces/url-interfaces';
import { ETableHeaderSelectors } from '../common/table/table.header';

const PAGE_URL = EPagesUrl.tradingStats;
const dailyTableItems = ['PNL', 'ARB', 'Trades'];
const monthlyTabItems = [
    'Monthly Stats',
    'Profits',
    'ARB Volume Stats',
    'ARB Maker Volume Stats',
    'ARB Taker Volume Stats',
    'ARB Fees Stats',
];

const monthlyARBTable = ['Strategy|Breakdown', 'Name', 'Total', 'Jun 06'];
const monthlyProfitsTable = ['Name', 'Jun 06'];

export enum EFilterModalSelector {
    FilterModal = '[class*="ant-form ant-form-vertical"]',
    OpenTableArrow = '[class="ag-group-contracted "]',
    CloseButton = '[class="flexlayout__tab_button_trailing"]',
    CloseIconFilterButton = '[data-icon="close"]',
}

class TradingStatsPage extends BasePage {
    readonly mainTitleText = new Text(ETradingStatsSelectors.App);
    readonly dailyStatsButton = new Button(ETradingStatsSelectors.DailyStatsButton);
    readonly tradingSinceDateInput = new Input(ETradingStatsSelectors.TradingSinceDateInput);
    readonly tradingTillDateInput = new Input(ETradingStatsSelectors.TradingTillDateInput);
    readonly monthlyStatsButton = new Button(ETradingStatsSelectors.MonthlyStatsButton);
    readonly resetLayoutButton = new Button(EMainMenuModalSelectors.ResetLayoutButton);
    readonly addTabButton = new Button(EMainMenuModalSelectors.AddTabButton);
    readonly filterModal = new Text(EFilterModalSelector.FilterModal, false);
    readonly openTableArrow = new Text(EFilterModalSelector.OpenTableArrow, false);
    readonly closeButton = new Button(EFilterModalSelector.CloseButton, false);
    readonly closeIconFilterButton = new Button(EFilterModalSelector.CloseIconFilterButton, false);

    constructor() {
        super(PAGE_URL);
    }

    checkElementsExists(): void {
        this.mainTitleText.checkExists();
    }

    openPageByBackendServer(nameServer: string): void {
        const backendServerUrl = getBackendServerUrl(PAGE_URL, nameServer);
        cy.visit(backendServerUrl);
    }

    openPageWithBackendServer(): void {
        const backendServerUrl = getBackendServerUrl(PAGE_URL, BasePage.backendServerName);
        cy.visit(backendServerUrl);
        this.checkElementsExists();
    }

    checkDailyVisibleTable(): void {
        const selector = testSelector(ETradingStatsSelectors.App);
        for (const value of dailyTableItems) {
            cy.contains(selector, value);
        }
    }

    openPageServersByName(namePage: string): void {
        cy.visit(`${PAGE_URL}/${BasePage.backendServerName}/${namePage}`);
        this.checkElementsExists();
    }

    openPageServersByDate(date: string, namePage: string): void {
        cy.visit(`${PAGE_URL}/${BasePage.backendServerName}/${namePage}?${date}`);
        this.checkElementsExists();
    }

    openPageServersByDateByTab(date: string, namePage: string, nameTab: string): void {
        cy.visit(
            `${PAGE_URL}/${BasePage.backendServerName}/${namePage}?tab=${nameTab}&singleTab=true&${date}`,
        );
        this.checkElementsExists();
    }

    openPageServersByDateByBacktestingID(date: string, namePage: string, backtestingID): void {
        cy.visit(
            `${PAGE_URL}/${BasePage.backendServerName}/${namePage}?${date}&backtestingId=${backtestingID}`,
        );
        this.checkElementsExists();
    }

    openPageServersByDateByBacktestingIDByTab(
        date: string,
        namePage: string,
        backtestingID,
        nameTab: string,
    ): void {
        cy.visit(
            `${PAGE_URL}/${BasePage.backendServerName}/${namePage}?tab=${nameTab}&singleTab=true&${date}&backtestingId=${backtestingID}`,
        );
        this.checkElementsExists();
    }

    checkMonthlyVisibleTable(): void {
        const selector = testSelector(ETradingStatsSelectors.App);
        for (const value of monthlyTabItems) {
            cy.contains(selector, value);
        }
    }

    checkVisibleARBTable(): void {
        const selector = ETableHeaderSelectors.TableHeaderText;
        for (const value of monthlyARBTable) {
            cy.contains(selector, value);
        }
    }

    checkVisibleProfitsTable(): void {
        const selector = ETableHeaderSelectors.TableHeaderText;
        for (const value of monthlyProfitsTable) {
            cy.contains(selector, value);
        }
    }

    checkVisibleFilter(namePage: string): void {
        const text = EFilterModalSelector.FilterModal;
        const values = [
            'Include',
            'Exclude',
            'Strategies',
            'Volume Assets',
            'Any Assets',
            'Exchanges',
            'Instruments',
        ];

        if (namePage === 'Monthly') {
            values.unshift('Interval');
        }

        if (namePage === 'Daily') {
            values.unshift('Date');
        }

        values.forEach((value) => {
            cy.contains(text, value);
        });
    }
}

export const tradingStatsPage = new TradingStatsPage();
