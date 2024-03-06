import { testSelector } from '@frontend/common/e2e';
import { EDashboardPageSelectors } from '@frontend/common/e2e/selectors/dashboard/dashboard.page.selectors';
import { EDashboardPanelSelectors } from '@frontend/common/e2e/selectors/dashboard/dashboard.panel.selectors';

import { BasePage } from '../../base.page';
import { Button } from '../../base/elements/button';
import { Input } from '../../base/elements/input';
import { Text } from '../../base/elements/text';
import { UploadFile } from '../../base/elements/uploadFile';
import { TDashboardData } from '../../interfaces/dashboard/dashboardData';
import { EPagesUrl } from '../../interfaces/url-interfaces';
import { customWait } from '../../web-socket/server';

const PAGE_URL = EPagesUrl.dashboard;

const orangeColor = '#ec5800';

const yellowColor = 'rgb(255, 255, 0)';
const blueColor = 'rgb(0, 0, 255)';
const redColor = 'rgb(255, 0, 0)';

class DashboardPage extends BasePage {
    readonly mainTitleText = new Text(EDashboardPageSelectors.App);
    readonly importConfigButton = new Button(EDashboardPageSelectors.ImportConfigButton);
    readonly importFileInput = new UploadFile(EDashboardPageSelectors.ImportFileInput);
    readonly dashboardImportButton = new UploadFile(EDashboardPageSelectors.DashboardImportButton);
    readonly setBacktestingMenuButton = new Button(
        EDashboardPageSelectors.SetBacktestingMenuButton,
    );
    readonly dashboardsMenuButton = new Button(EDashboardPageSelectors.DashboardsMenuButton);
    readonly dashboardsCard = new Text(EDashboardPageSelectors.Card);
    readonly chartLegends = new Text(EDashboardPageSelectors.ChartLegends);
    readonly panelButton = new Text(EDashboardPanelSelectors.PanelButton);
    readonly panelInput = new Input(EDashboardPanelSelectors.PanelInput, false);
    readonly tableCell = new Text(EDashboardPageSelectors.TableCell, false);
    readonly tableHeader = new Text(EDashboardPageSelectors.TableHeader, false);
    readonly tableBody = new Text(EDashboardPageSelectors.TableBody, false);
    readonly tableButton = new Button(EDashboardPageSelectors.TableButton, false);
    readonly tableRow = new Text(EDashboardPageSelectors.TableRow, false);
    readonly grid = new Text(EDashboardPageSelectors.Grid, false);

    constructor() {
        super(PAGE_URL);
    }

    checkElementsExists(): void {
        this.mainTitleText.checkExists();
    }

    checkMenuVisible(): void {
        this.dashboardsMenuButton.checkVisible();
        this.setBacktestingMenuButton.checkVisible();
    }

    checkVisiblePanel(data: TDashboardData): void {
        cy.get(testSelector(EDashboardPageSelectors.Card))
            .eq(0)
            .should('contain.text', data.namePanel);
        cy.get(testSelector(EDashboardPageSelectors.Card))
            .eq(1)
            .should('contain.text', data.labelTwoPanelFour);
        cy.get(testSelector(EDashboardPageSelectors.Card))
            .eq(2)
            .should('contain.text', data.labelTwoPanelTwo);
    }

    checkVisibleLabels(data: TDashboardData): void {
        this.checkLabels(data);
    }

    checkLabels(data: TDashboardData): void {
        cy.get(testSelector(EDashboardPageSelectors.Card))
            .eq(0)
            .should('contain.text', data.labelOnePanelOne)
            .should('contain.text', data.labelTwoPanelOne);

        cy.get(testSelector(EDashboardPageSelectors.Card))
            .eq(1)
            .should('contain.text', data.labelOnePanelTwo)
            .should('contain.text', data.labelTwoPanelTwo);

        cy.get(testSelector(EDashboardPageSelectors.Card))
            .eq(2)
            .should('contain.text', data.labelOnePanelThree)
            .should('contain.text', data.labelTwoPanelThree);

        cy.get(testSelector(EDashboardPageSelectors.Card))
            .eq(3)
            .should('contain.text', data.labelOnePanelFour)
            .should('contain.text', data.labelTwoPanelFour);
    }

    checkVisibleIndicatorLabels(data: TDashboardData): void {
        cy.get(testSelector(EDashboardPageSelectors.Card))
            .eq(0)
            .should('contain.text', data.labelOnePanelOne)
            .should('contain.text', data.labelTwoPanelOne)
            .should('contain.text', data.labelOnePanelTwo)
            .should('contain.text', data.labelTwoPanelTwo)
            .should('contain.text', data.labelOnePanelThree)
            .should('contain.text', data.labelTwoPanelThree)
            .should('contain.text', data.labelOnePanelFour)
            .should('contain.text', data.labelTwoPanelFour);
    }

    setConfig(nameFile: string) {
        const filePath = `cypress/fixtures/dashboard/custom-view/${nameFile}`;
        cy.readFile(filePath).then((text) => {
            cy.get(EDashboardPanelSelectors.PanelInput)
                .first()
                .clear()
                .type(text, { force: true, delay: 0 });
        });
    }

    checkDataHeaderTable() {
        const headers = ['Currency', 'Disbalance', 'Axis', 'State'];
        cy.get(EDashboardPageSelectors.TableHeader).within(() => {
            headers.forEach((header) => {
                cy.contains(header);
            });
        });
    }

    checkDataHeaderGrid() {
        const headers = ['Header1', 'Header2', 'Header3', 'Header4'];
        cy.get(EDashboardPageSelectors.TableHeader).within(() => {
            headers.forEach((header) => {
                cy.contains(header);
            });
        });
    }

    checkDataBodyGrid() {
        const body = [
            '[Style 1]: ',
            '[Style 2]: seconds',
            '[Value 1]:',
            '[Value 2]: seconds',
            'Overwrite: ',
            'Overwrite: seconds',
        ];
        cy.get(EDashboardPageSelectors.TableBody).within(() => {
            body.forEach((body) => {
                cy.contains(body);
            });
        });
    }

    checkIndicatorColumnNotEmpty() {
        const indicatorCellLocator = '[data-row-key] > :nth-child(4) span';
        let nonEmptyCount = 0;

        cy.wait(60000);
        cy.get(indicatorCellLocator)
            .each(($span) => {
                if ($span.text().trim()) {
                    nonEmptyCount++;
                }
            })
            .then(() => {
                expect(nonEmptyCount).to.be.at.least(30);
            });
    }

    checkContainColorRow() {
        cy.get(`[class*="${orangeColor}"]`).should('exist');
        cy.get(`[class*="${orangeColor}"]`).should('be.visible');
    }

    checkGridValue() {
        ['Test Indicators Grid', 'Base text1', 'Base text2', 'Base text3'].forEach((text) => {
            this.dashboardsCard.contains(text);
        });
        this.grid.checkVisible();
        this.grid.get().should('have.css', 'background-color', yellowColor);
    }

    checkTableValue() {
        ['Test Indicators Table', 'Level1.1', 'Level1.2', 'Level1.3'].forEach((text) => {
            this.dashboardsCard.contains(text);
        });
        ['Header1', 'Header2', 'Header3'].forEach((text) => {
            this.tableHeader.contains(text);
        });
        this.tableButton.click();

        ['Level2.1', 'Level2.2', 'Level2.3'].forEach((text) => {
            this.dashboardsCard.contains(text);
        });
        this.tableButton.lastClick();

        ['Level3.1', 'Level3.2'].forEach((text) => {
            this.dashboardsCard.contains(text);
        });

        this.tableCell.get().eq(4).should('have.css', 'background-color', blueColor);
        this.tableCell.get().eq(6).should('have.css', 'background-color', redColor);
    }

    comparisonByDateScreenshot() {
        const expectedImage = 'cypress/e2e/dashboard/screenshots/focusToDate.png';
        const actualImage = 'cypress/screenshots/dashboard-page.feature/focusToDate.png';
        cy.viewport(714, 714);
        cy.get('canvas').should('exist').should('be.visible').should('have.length', 4);
        // customWait(60);
        cy.get('canvas')
            .first()
            .should(($canvas) => {
                const image = new Image();
                image.src = $canvas[0].toDataURL();
                return image.complete;
            })
            .then(() => {
                cy.get('canvas')
                    .first()
                    .screenshot('focusToDate')
                    .then(() => {
                        cy.readFile(expectedImage, 'base64').then((base64ExpectedImage) => {
                            cy.readFile(actualImage, 'base64').then((base64ActualImage) => {
                                expect(base64ExpectedImage).to.equal(base64ActualImage);
                            });
                        });
                    });
            });
    }

    doScreenshot(graphName?: string): void {
        cy.viewport(714, 714);
        customWait(20);
        cy.get('canvas').first().screenshot('focusToDate');
        const options = {
            maxDiffThreshold: 0.0001,
            title: graphName,
        };

        cy.get('canvas').first().matchImage(options);
    }
}

export const dashboardPage = new DashboardPage();
