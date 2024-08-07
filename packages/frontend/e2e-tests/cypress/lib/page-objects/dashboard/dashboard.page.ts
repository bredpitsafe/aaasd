import { testSelector } from '@frontend/common/e2e';
import { EDashboardPageSelectors } from '@frontend/common/e2e/selectors/dashboard/dashboard.page.selectors';
import { EDashboardPanelSelectors } from '@frontend/common/e2e/selectors/dashboard/dashboard.panel.selectors';
import { ELayoutSelectors } from '@frontend/common/e2e/selectors/layout.selectors';

import { BasePage } from '../../base.page';
import { Button } from '../../base/elements/button';
import { Input } from '../../base/elements/input';
import { Text } from '../../base/elements/text';
import { UploadFile } from '../../base/elements/uploadFile';
import { TDashboardData } from '../../interfaces/dashboard/dashboardData';
import { EPagesUrl } from '../../interfaces/url-interfaces';
import { customWait } from '../../web-socket/server';

const PAGE_URL = EPagesUrl.dashboard;

const orangeColor = 'rgb(236, 88, 0)';
const yellowColor = 'rgb(255, 255, 0)';
const blueColor = 'rgb(0, 0, 255)';
const redColor = 'rgb(255, 0, 0)';

class DashboardPage extends BasePage {
    readonly mainTitleText = new Text(EDashboardPageSelectors.App);
    readonly importFileInput = new UploadFile(EDashboardPageSelectors.ImportFileInput);
    readonly dashboardImportButton = new UploadFile(EDashboardPageSelectors.DashboardImportButton);
    readonly setBacktestingInput = new Input(EDashboardPageSelectors.SetBacktestingInput);
    readonly selectDashboardButton = new Button(EDashboardPageSelectors.SelectDashboardButton);
    readonly dashboardsCard = new Text(EDashboardPageSelectors.DashboardCard);
    readonly focusToNowButton = new Text(EDashboardPageSelectors.FocusToNowButton);
    readonly setLayoutButton = new Text(EDashboardPageSelectors.SetLayoutButton);
    readonly layoutNameInput = new Input(EDashboardPageSelectors.LayoutNameInput);
    readonly addLayoutNameButton = new Input(EDashboardPageSelectors.AddLayoutNameButton);
    readonly editDashboardButton = new Text(EDashboardPageSelectors.EditDashboardButton);
    readonly addPanelButton = new Text(EDashboardPageSelectors.AddPanelButton);
    readonly setLayoutPopover = new Text(EDashboardPageSelectors.SetLayoutPopover, false);
    readonly setLayoutItems = new Text(EDashboardPageSelectors.SetLayoutItems, false);
    readonly setPanelItem = new Text(EDashboardPageSelectors.SetPanelItem, false);
    readonly deleteLayoutIcon = new Button(EDashboardPageSelectors.DeleteLayoutIcon, false);
    readonly saveChangesButton = new Text(EDashboardPageSelectors.SaveChangesButton);
    readonly revertChangesButton = new Text(EDashboardPageSelectors.RevertChangesButton);
    readonly exportCloneButton = new Text(EDashboardPageSelectors.ExportCloneButton);
    readonly shareDashboardButton = new Text(EDashboardPageSelectors.ShareDashboardButton);
    readonly toggleSyncModButton = new Text(EDashboardPageSelectors.ToggleSyncModButton);
    readonly toggleCompactModeButton = new Text(EDashboardPageSelectors.ToggleCompactModeButton);
    readonly chartLegends = new Text(EDashboardPageSelectors.ChartLegends);
    readonly panelButton = new Text(EDashboardPanelSelectors.PanelButton);
    readonly panelEditButton = new Text(EDashboardPanelSelectors.PanelEditButton);
    readonly panelHoldDragButton = new Text(EDashboardPanelSelectors.PanelHoldDragButton);
    readonly panelSettingsButton = new Text(EDashboardPanelSelectors.PanelSettingsButton);
    readonly panelFullscreenButton = new Text(EDashboardPanelSelectors.PanelFullscreenButton);
    readonly panelShowLegendButton = new Text(EDashboardPanelSelectors.PanelShowLegendButton);
    readonly panelInput = new Input(EDashboardPanelSelectors.PanelInput, false);
    readonly tableCell = new Text(EDashboardPageSelectors.TableCell, false);
    readonly tableHeader = new Text(EDashboardPageSelectors.TableHeader, false);
    readonly tableButton = new Button(EDashboardPageSelectors.TableButton, false);
    readonly tableRow = new Text(EDashboardPageSelectors.TableRow, false);
    readonly grid = new Text(EDashboardPageSelectors.Grid, false);
    readonly gridItem = new Text(EDashboardPageSelectors.GridItem, false);

    constructor() {
        super(PAGE_URL);
    }

    checkElementsExists(): void {
        this.mainTitleText.checkExists();
    }

    checkMenuVisible(): void {
        this.focusToNowButton.checkVisible();
        this.setLayoutButton.checkVisible();
        this.addPanelButton.checkVisible();
        this.editDashboardButton.checkVisible();
        this.saveChangesButton.checkVisible();
        this.revertChangesButton.checkVisible();
        this.exportCloneButton.checkVisible();
        this.dashboardImportButton.checkVisible();
        this.selectDashboardButton.checkVisible();
        this.setBacktestingInput.checkVisible();
    }

    checkAllButtonsDisabled(): void {
        this.focusToNowButton.checkNotEnabled();
        this.setLayoutButton.checkNotEnabled();
        this.addPanelButton.checkNotEnabled();
        this.editDashboardButton.checkNotEnabled();
        this.saveChangesButton.checkNotEnabled();
        this.revertChangesButton.checkNotEnabled();
        this.exportCloneButton.checkNotEnabled();
    }

    checkAllButtonsEnabled(): void {
        this.focusToNowButton.checkEnabled();
        this.setLayoutButton.checkEnabled();
        this.addPanelButton.checkEnabled();
        this.editDashboardButton.checkEnabled();
        this.saveChangesButton.checkEnabled();
        this.revertChangesButton.checkEnabled();
        this.exportCloneButton.checkEnabled();
    }

    checkSaveAndRevertButtonsDisabled(): void {
        this.focusToNowButton.checkEnabled();
        this.setLayoutButton.checkEnabled();
        this.addPanelButton.checkEnabled();
        this.editDashboardButton.checkEnabled();
        this.saveChangesButton.checkNotEnabled();
        this.revertChangesButton.checkNotEnabled();
        this.exportCloneButton.checkEnabled();
    }

    checkVisiblePanelMenu(): void {
        this.panelButton.checkVisible();
        this.panelEditButton.checkVisible();
        this.panelHoldDragButton.checkVisible();
        this.panelSettingsButton.checkVisible();
        this.panelFullscreenButton.checkVisible();
        this.panelShowLegendButton.checkVisible();
    }

    checkNotVisiblePanelMenu(): void {
        this.panelButton.checkNotExists();
        this.panelEditButton.checkNotExists();
        this.panelHoldDragButton.checkNotExists();
        this.panelSettingsButton.checkNotExists();
        this.panelFullscreenButton.checkNotExists();
        this.panelShowLegendButton.checkNotExists();
    }

    checkVisiblePanel(data: TDashboardData): void {
        cy.get(testSelector(EDashboardPageSelectors.DashboardCard))
            .eq(0)
            .should('contain.text', data.namePanel);
        cy.get(testSelector(EDashboardPageSelectors.DashboardCard))
            .eq(1)
            .should('contain.text', data.labelTwoPanelFour);
        cy.get(testSelector(EDashboardPageSelectors.DashboardCard))
            .eq(2)
            .should('contain.text', data.labelTwoPanelTwo);
    }

    checkVisibleLabels(data: TDashboardData): void {
        this.checkLabels(data);
    }

    checkLabels(data: TDashboardData): void {
        cy.get(testSelector(EDashboardPageSelectors.DashboardCard))
            .eq(0)
            .should('contain.text', data.labelOnePanelOne)
            .should('contain.text', data.labelTwoPanelOne);

        cy.get(testSelector(EDashboardPageSelectors.DashboardCard))
            .eq(1)
            .should('contain.text', data.labelOnePanelTwo)
            .should('contain.text', data.labelTwoPanelTwo);

        cy.get(testSelector(EDashboardPageSelectors.DashboardCard))
            .eq(2)
            .should('contain.text', data.labelOnePanelThree)
            .should('contain.text', data.labelTwoPanelThree);

        cy.get(testSelector(EDashboardPageSelectors.DashboardCard))
            .eq(3)
            .should('contain.text', data.labelOnePanelFour)
            .should('contain.text', data.labelTwoPanelFour);
    }

    checkVisibleIndicatorLabels(data: TDashboardData): void {
        cy.get(testSelector(EDashboardPageSelectors.DashboardCard))
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
            cy.get(EDashboardPanelSelectors.PanelInput).type(text, { force: true, delay: 0 });
        });
    }

    checkDataHeaderTable() {
        const headers = ['Currency', 'Disbalance', 'Axis', 'State'];
        headers.forEach((header) => {
            this.tableHeader.checkContain(header);
        });
    }

    checkDataHeaderGrid() {
        const headers = ['Header1', 'Header2', 'Header3', 'Header4'];
        headers.forEach((header) => {
            this.tableHeader.checkContain(header);
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
        const indicatorCellLocator = '[role="row"] > :nth-child(4) span';
        let nonEmptyCount = 0;

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
        const rowSelector = '[role="row"]';
        let count = 0;

        cy.get(rowSelector)
            .each(($row) => {
                cy.wrap($row)
                    .invoke('css', 'background-color')
                    .then((backgroundColor) => {
                        const colorString = JSON.stringify(backgroundColor);
                        if (colorString === JSON.stringify(orangeColor)) {
                            count++;
                        }
                    });
            })
            .then(() => {
                expect(count).to.be.at.least(15);
            });
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
        this.tableButton.clickLast();

        ['Level3.1', 'Level3.2'].forEach((text) => {
            this.dashboardsCard.contains(text);
        });

        this.tableCell.get().eq(4).should('have.css', 'background-color', blueColor);
        this.tableCell.get().eq(7).should('have.css', 'background-color', redColor);
    }

    comparisonByDateScreenshot() {
        const expectedImage = 'cypress/e2e/dashboard/screenshots/focusToDate.png';
        const actualImage = 'cypress/screenshots/dashboard-page.feature/focusToDate.png';
        cy.viewport(714, 714);
        cy.get('canvas').should('exist').should('be.visible').should('have.length', 4);
        customWait(60);
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
        cy.get('canvas').first().screenshot(graphName);
        const options = {
            maxDiffThreshold: 0.0001,
            matchAgainstPath: `cypress/e2e/dashboard/__image_snapshots__/${graphName}.png`,
            title: graphName,
        };

        cy.get('canvas').first().matchImage(options);
    }

    checkLayout(nameLayout: string): void {
        customWait(5);
        cy.viewport(1200, 1600);
        cy.get(ELayoutSelectors.GridLayout).first().screenshot(nameLayout);
        const options = {
            maxDiffThreshold: 0.0001,
            matchAgainstPath: `cypress/e2e/dashboard/__image_snapshots__/${nameLayout}.png`,
            title: nameLayout,
        };
        cy.get(ELayoutSelectors.GridLayout).first().matchImage(options);
    }

    checkVisibleLayout(nameLayout: string): void {
        this.checkVisiblePanelMenu();
        switch (nameLayout) {
            case 'Chart':
                this.dashboardsCard.contains('ETHUSDT|Binance.l1.ask.rep.0.1:');
                break;
            case 'Edit Chart':
                this.dashboardsCard.contains('ETHUSDT|Binance.l1.ask.rep.0.1');
                this.dashboardsCard.contains('BTCUSDT|Binance.l1.ask.rep.0.1');
                break;
            case 'Table':
                this.tableHeader.checkContain('Header2.0');
                this.tableHeader.checkContain('Header3');
                this.tableHeader.checkContain('Header4');
                this.tableCell.checkContain('Level 1.1');
                this.tableCell.checkContain('Level 1.2');
                this.tableCell.checkContain('ALGO|TEST_RND|01 age:  seconds');
                this.tableCell.checkContain('Base text: ');
                break;
            case 'Grid':
                this.grid.checkContain('Base text: ');
                this.grid.checkContain('Base text:  seconds');
                break;
        }
    }

    checkWidthHeightCard(widthValue: string, heightValue: string): void {
        this.gridItem.get().each(($el) => {
            cy.wrap($el).should('have.css', 'width', widthValue);
            cy.wrap($el).should('have.css', 'height', heightValue);
        });
    }

    checkVisibleSetLayoutPopover(): void {
        const layoutItems = [
            '1x2',
            '1x3',
            '1x4',
            '2x1',
            '2x2',
            '2x3',
            '3x1',
            '3x2',
            '3x3',
            '4x3',
            '4x4',
            '6x6',
        ];

        layoutItems.forEach((item) => dashboardPage.setLayoutItems.checkContain(item));

        dashboardPage.setLayoutPopover.checkVisible();
        dashboardPage.layoutNameInput.checkVisible();
        dashboardPage.addLayoutNameButton.checkVisible();
    }
}

export const dashboardPage = new DashboardPage();
