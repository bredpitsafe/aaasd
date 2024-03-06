import { testSelector } from '@frontend/common/e2e';
import { EMainMenuModalSelectors } from '@frontend/common/e2e/selectors/main-menu.modal.selectors';
import { ETradingStatsSelectors } from '@frontend/common/e2e/selectors/trading-stats/trading-stats.page.selectors';

import { getBackendServerUrl } from '../../../support/asserts/comon-url-assert';
import { BasePage } from '../../base.page';
import { Button } from '../../base/elements/button';
import { Text } from '../../base/elements/text';
import { EPagesUrl } from '../../interfaces/url-interfaces';

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

export enum EFilterModalSelector {
    FilterModal = '[class*="ant-form ant-form-vertical"]',
    OpenTableArrow = '[class="ag-group-contracted "]',
    CloseButton = '[class="flexlayout__tab_button_trailing"]',
}

class TradingStatsPage extends BasePage {
    readonly mainTitleText = new Text(ETradingStatsSelectors.App);
    readonly dailyStatsButton = new Button(ETradingStatsSelectors.DailyStatsButton);
    readonly monthlyStatsButton = new Button(ETradingStatsSelectors.MonthlyStatsButton);
    readonly resetLayoutButton = new Button(EMainMenuModalSelectors.ResetLayoutButton);
    readonly addTabButton = new Button(EMainMenuModalSelectors.AddTabButton);
    readonly filterModal = new Text(EFilterModalSelector.FilterModal, false);
    readonly openTableArrow = new Text(EFilterModalSelector.OpenTableArrow, false);
    readonly closeButton = new Button(EFilterModalSelector.CloseButton, false);

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
        cy.visit(`${PAGE_URL}/${BasePage.backendServerName}/${namePage}${date}`);
        this.checkElementsExists();
    }

    checkMonthlyVisibleTable(): void {
        const selector = testSelector(ETradingStatsSelectors.App);
        for (const value of monthlyTabItems) {
            cy.contains(selector, value);
        }
    }

    checkVisibleFilter(namePage: string): void {
        const text = EFilterModalSelector.FilterModal;
        const values = [
            'Include',
            'Exclude',
            'Strategies',
            'Quote Assets',
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
