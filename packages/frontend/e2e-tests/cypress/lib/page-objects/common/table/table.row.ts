import { contextMenu } from '../context.menu';

const XLSX = require('xlsx');

import { testSelector } from '@frontend/common/e2e';
import { EDashboardsTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/dashboards-tab/dashboards.tab.selectors';

import { Text } from '../../../base/elements/text';
import { customWait } from '../../../web-socket/server';
import { confirmModal } from '../confirm.modal';
import { ETableHeaderSelectors, TableHeader, tableHeader } from './table.header';

export enum ETableBodySelectors {
    TableBody = '[class*=ag-body-viewport]',
}

export enum ETableRowSelectors {
    ArrowButton = `${ETableHeaderSelectors.TableBody} [aria-colindex="1"] [class="ag-group-contracted "]`,
    ArrowRightsButton = `${ETableBodySelectors.TableBody} [aria-colindex="1"] [class="ag-group-expanded "]`,
    IDRowText = `${ETableBodySelectors.TableBody} [col-id="id"]`,
    TaskIDRowText = `${ETableBodySelectors.TableBody} [col-id="taskId"]`,
    CreatesRowText = `${ETableBodySelectors.TableBody} [col-id="createTime"]`,
    NameRowText = `${ETableBodySelectors.TableBody} [col-id="name"]`,
    DashboardRowText = `${ETableBodySelectors.TableBody} [col-id="dashboard"]`,
    UserNameRowText = `${ETableBodySelectors.TableBody} [col-id="username"]`,
    ActualStatusRowText = `${ETableBodySelectors.TableBody} [col-id="actualStatus"]`,
    UpdateTimeRowText = `${ETableBodySelectors.TableBody} [col-id="updateTime"]`,
    ValueRowText = `${ETableBodySelectors.TableBody} [col-id="value"]`,
    ComponentRowText = `${ETableBodySelectors.TableBody} [col-id="component"]`,
    PlatformTimeRowText = `${ETableBodySelectors.TableBody} [col-id="platformTime"]`,
    ExchangeTimeRowText = `${ETableBodySelectors.TableBody} [col-id="exchangeTime"]`,
    MakerRowText = `${ETableBodySelectors.TableBody} [col-id="market"]`,
    RoleRowText = `${ETableBodySelectors.TableBody} [col-id="role"]`,
    PriceRowText = `${ETableBodySelectors.TableBody} [col-id="price"]`,
    FeeAmountRowText = `${ETableBodySelectors.TableBody} [col-id="feeAmount"]`,
    StatusTaskRowText = `${ETableBodySelectors.TableBody} [col-id="status"]`,
    TypeTaskRowText = `${ETableBodySelectors.TableBody} [col-id="taskType"]`,
    CoinRowText = `${ETableBodySelectors.TableBody} [col-id="coin"]`,
    SourceRowText = `${ETableBodySelectors.TableBody} [col-id="source"]`,
    DestinationRowText = `${ETableBodySelectors.TableBody} [col-id="destination"]`,
    CoinRuleRowText = `${ETableBodySelectors.TableBody} [col-id="coinsMatchRule"]`,
    SourceExchangeRowText = `${ETableBodySelectors.TableBody} [col-id="source.exchangesMatchRule"]`,
    SourceAccountRowText = `${ETableBodySelectors.TableBody} [col-id="source.accountsMatchRule"]`,
    DestinationExchangeRowText = `${ETableBodySelectors.TableBody} [col-id="destination.exchangesMatchRule"]`,
    DestinationAccountRowText = `${ETableBodySelectors.TableBody} [col-id="destination.accountsMatchRule"]`,
    BothDirectionsRowText = `${ETableBodySelectors.TableBody} [col-id="withOpposite"]`,
    NoteRowText = `${ETableBodySelectors.TableBody} [col-id="note"]`,
}

export class TableRow extends TableHeader {
    readonly arrowButton = new Text(ETableRowSelectors.ArrowButton, false);
    readonly arrowRightsButton = new Text(ETableRowSelectors.ArrowRightsButton, false);
    readonly idRowText = new Text(ETableRowSelectors.IDRowText, false);
    readonly taskIDRowText = new Text(ETableRowSelectors.TaskIDRowText, false);
    readonly createsRowText = new Text(ETableRowSelectors.CreatesRowText, false);
    readonly nameRowText = new Text(ETableRowSelectors.NameRowText, false);
    readonly dashboardRowText = new Text(ETableRowSelectors.DashboardRowText, false);
    readonly userNameRowText = new Text(ETableRowSelectors.UserNameRowText, false);
    readonly actualStatusRowText = new Text(ETableRowSelectors.ActualStatusRowText, false);
    readonly updateTimeRowText = new Text(ETableRowSelectors.UpdateTimeRowText, false);
    readonly componentRowText = new Text(ETableRowSelectors.ComponentRowText, false);
    readonly platformTimeRowText = new Text(ETableRowSelectors.PlatformTimeRowText, false);
    readonly exchangeTimeRowText = new Text(ETableRowSelectors.ExchangeTimeRowText, false);
    readonly makerRowText = new Text(ETableRowSelectors.MakerRowText, false);
    readonly roleRowText = new Text(ETableRowSelectors.RoleRowText, false);
    readonly priceRowText = new Text(ETableRowSelectors.PriceRowText, false);
    readonly feeAmountRowText = new Text(ETableRowSelectors.FeeAmountRowText, false);
    readonly statusTaskRowText = new Text(ETableRowSelectors.StatusTaskRowText, false);
    readonly coinRowText = new Text(ETableRowSelectors.CoinRowText, false);
    readonly coinRuleRowText = new Text(ETableRowSelectors.CoinRuleRowText, false);
    readonly sourceExchangeRowText = new Text(ETableRowSelectors.SourceExchangeRowText, false);
    readonly sourceAccountRowText = new Text(ETableRowSelectors.SourceAccountRowText, false);
    readonly destinationExchangeRowText = new Text(
        ETableRowSelectors.DestinationExchangeRowText,
        false,
    );
    readonly destinationAccountRowText = new Text(
        ETableRowSelectors.DestinationAccountRowText,
        false,
    );
    readonly bothDirectionsRowText = new Text(ETableRowSelectors.BothDirectionsRowText, false);
    readonly noteRowText = new Text(ETableRowSelectors.NoteRowText, false);
    readonly sourceRowText = new Text(ETableRowSelectors.SourceRowText, false);
    readonly destinationRowText = new Text(ETableRowSelectors.DestinationRowText, false);
    readonly dashboardLinkText = new Text(EDashboardsTabSelectors.DashboardLink);
    readonly dashboardLinkButton = new Text(EDashboardsTabSelectors.DashboardLinkButton);

    clickFirstArrow() {
        this.arrowButton.checkVisible();
        this.arrowButton.firstClick();
    }

    checkAllRowsContainText(name: string): void {
        const nameTextLocator = ETableRowSelectors.NameRowText;
        cy.get(ETableHeaderSelectors.TableBody)
            .last()
            .should('be.visible')
            .within(($element) => {
                if ($element.find(nameTextLocator).length > 0) {
                    cy.get(nameTextLocator).each(($elem) => {
                        cy.wrap($elem).contains(name, { matchCase: false });
                    });
                }
            });
    }

    checkAllRowsContainDashboardName(name: string): void {
        const nameTextLocator = ETableRowSelectors.DashboardRowText;
        cy.get(ETableHeaderSelectors.TableBody)
            .last()
            .should('be.visible')
            .within(($element) => {
                if ($element.find(nameTextLocator).length > 0) {
                    cy.get(nameTextLocator).each(($elem) => {
                        cy.wrap($elem).contains(name, { matchCase: false });
                    });
                }
            });
    }

    checkAllRowsIsContainStatus(name: string, isContain: boolean): void {
        const nameTextLocator = ETableRowSelectors.StatusTaskRowText;
        const containAssertion = isContain ? 'contain' : 'not.contain.text';

        cy.get(ETableHeaderSelectors.TableBody)
            .should('be.visible')
            .then(() => {
                cy.get(nameTextLocator).each(($elem) => {
                    cy.wrap($elem).should(containAssertion, name, { matchCase: false });
                });
            });
    }

    checkAllRowsContainType(name: string): void {
        const nameTextLocator = ETableRowSelectors.TypeTaskRowText;
        cy.get(ETableHeaderSelectors.TableBody)
            .should('be.visible')
            .then(() => {
                cy.get(nameTextLocator).each(($elem) => {
                    cy.wrap($elem).should('contain', name);
                });
            });
    }

    checkAllRowsNotContainText(name: string): void {
        const nameTextLocator = ETableRowSelectors.NameRowText;
        cy.get(ETableHeaderSelectors.TableBody)
            .should('be.visible')
            .then(($element) => {
                if ($element.find(nameTextLocator).length > 0) {
                    cy.get(nameTextLocator).each(($elem) => {
                        cy.wrap($elem).should('not.contain', name);
                    });
                }
            });
    }

    checkRowsContainDataText(date: string): void {
        const nameTextLocator = ETableRowSelectors.UpdateTimeRowText;
        cy.get(ETableHeaderSelectors.TableBody)
            .should('be.visible')
            .then(($element) => {
                if ($element.find(nameTextLocator).length > 0) {
                    cy.get(ETableHeaderSelectors.TableBody)
                        .find(nameTextLocator)
                        .each(($elem) => {
                            expect(date < $elem.text()).to.be.equal(true);
                        });
                }
            });
    }

    checkRowsContainSetDataText(startDate: string, endDate: string): void {
        const nameTextLocator = ETableRowSelectors.PlatformTimeRowText;
        cy.get(ETableHeaderSelectors.TableBody)
            .should('be.visible')
            .then(($element) => {
                if ($element.find(nameTextLocator).length > 0) {
                    cy.get(ETableHeaderSelectors.TableBody)
                        .find(nameTextLocator)
                        .each(($elem) => {
                            expect(startDate < $elem.text()).to.be.equal(true);
                            expect(endDate > $elem.text()).to.be.equal(true);
                        });
                }
            });
    }

    checkDownloadCSVRow(failName: string) {
        cy.fixture(failName).then((csv) => {
            const expectedText = csv;
            cy.window().then((win) => {
                win.navigator.clipboard.readText().then((text) => {
                    expect(text).to.equal(expectedText);
                });
            });
        });
    }

    checkDownloadTSVRow(failName: string) {
        cy.fixture(failName).then((tsv) => {
            const expectedText = tsv;
            cy.window().then((win) => {
                win.navigator.clipboard.readText().then((text) => {
                    expect(text).to.equal(expectedText);
                });
            });
        });
    }

    checkDownloadTXTRow(failName: string) {
        cy.fixture(failName).then((txt) => {
            const expectedText = txt.replace(/\n/g, '\r\n');
            cy.window().then((win) => {
                win.navigator.clipboard.readText().then((text) => {
                    expect(text).to.equal(expectedText);
                });
            });
        });
    }

    checkDownloadJSONRow(failName: string) {
        cy.fixture(failName).then((json) => {
            const expectedText = JSON.stringify(json, null, 2);
            cy.window().then((win) => {
                win.navigator.clipboard.readText().then((text) => {
                    expect(text).to.equal(expectedText);
                });
            });
        });
    }

    checkDownloadFile(nameDownloadedFile: string, nameFile: string) {
        cy.fixture(nameFile).then((csv) => {
            const expectedText = csv;

            cy.readFile(nameDownloadedFile).then((downloadedText) => {
                expect(downloadedText).to.equal(expectedText);
            });
        });
    }

    checkDownloadFileXlsm(nameDownloadedFile, nameFile) {
        cy.fixture(nameFile, 'binary').then((expectedXlsx) => {
            cy.readFile(nameDownloadedFile, 'binary').then((downloadedData) => {
                const expectedWorkbook = XLSX.read(expectedXlsx, { type: 'binary' });
                const downloadedWorkbook = XLSX.read(downloadedData, { type: 'binary' });

                const expectedSheet = expectedWorkbook.Sheets[expectedWorkbook.SheetNames[0]];
                const downloadedSheet = downloadedWorkbook.Sheets[downloadedWorkbook.SheetNames[0]];

                const expectedCsv = XLSX.utils.sheet_to_csv(expectedSheet);
                const downloadedCsv = XLSX.utils.sheet_to_csv(downloadedSheet);

                expect(downloadedCsv).to.equal(expectedCsv);
            });
        });
    }

    clickHeaderID() {
        tableHeader.clickHeaderByName('ID');
    }

    visitPageByLinkInRow() {
        customWait(1);
        cy.get(testSelector(EDashboardsTabSelectors.DashboardLink)).then(($button) => {
            const url = $button.prop('href');
            cy.visit(url);
        });
    }

    visitPageByLinkInButtonDashboard() {
        customWait(1);
        cy.get(testSelector(EDashboardsTabSelectors.DashboardLinkButton)).then(($button) => {
            const url = $button.prop('href');
            cy.visit(url);
        });
    }

    checkContainTextInColumn(nameTextLocator: string, textColumn: string) {
        cy.get(ETableHeaderSelectors.TableBody)
            .last()
            .should('be.visible')
            .then(() => {
                cy.get(nameTextLocator).each(($elem) => {
                    cy.wrap($elem).should('contain', textColumn);
                });
            });
    }

    checkContainCoin(coin: string) {
        this.checkContainTextInColumn(ETableRowSelectors.CoinRowText, coin);
    }

    checkContainCoinRule(coin: string) {
        this.checkContainTextInColumn(ETableRowSelectors.CoinRuleRowText, coin);
    }

    checkContainSource(source: string) {
        this.checkContainTextInColumn(ETableRowSelectors.SourceRowText, source);
    }

    checkContainDestination(destination: string) {
        this.checkContainTextInColumn(ETableRowSelectors.DestinationRowText, destination);
    }

    checkContainUserName(destination: string) {
        this.checkContainTextInColumn(ETableRowSelectors.UserNameRowText, destination);
    }

    checkContainActualStatus(source: string) {
        this.checkContainTextInColumn(ETableRowSelectors.ActualStatusRowText, source);
    }

    checkContainSourceAccount(destination: string) {
        this.checkContainTextInColumn(ETableRowSelectors.SourceAccountRowText, destination);
    }

    deleteAllCreatedRows(locator: string, nameUser: string, confirmText: string): void {
        const row = ETableRowSelectors.UserNameRowText;
        cy.get(locator)
            .should('be.visible')
            .then(($element) => {
                if ($element.find(row).length > 0) {
                    cy.get(row).each(($elem) => {
                        const rowText = $elem.text();
                        if (rowText.includes(nameUser)) {
                            cy.wrap($elem).rightclick();
                            contextMenu.contextMenu.containsClick(confirmText);
                            confirmModal.clickOkButton();
                        }
                    });
                }
            });
    }
}

export const tableRow = new TableRow();
