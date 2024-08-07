import { testSelector } from '@frontend/common/e2e';
import { EWSQueryTerminalSelectors } from '@frontend/common/e2e/selectors/ws-query-terminal/ws-query-terminal.page.selectors';

import { getBackendServerUrl } from '../../../support/asserts/comon-url-assert';
import { BasePage } from '../../base.page';
import { Input } from '../../base/elements/input';
import { Text } from '../../base/elements/text';
import { ERobots } from '../../interfaces/trading-servers-manager/robots-interfaces';
import { EPagesUrl } from '../../interfaces/url-interfaces';

const PAGE_URL = EPagesUrl.wsQueryTerminal;
const tabItems = ['History', 'Request', 'Response'];

class WSQueryTerminalPage extends BasePage {
    readonly mainTitleText = new Text(EWSQueryTerminalSelectors.App);
    readonly historyTab = new Text(EWSQueryTerminalSelectors.HistoryTab);
    readonly clearUnsavedButton = new Text(EWSQueryTerminalSelectors.ClearUnsavedButton);
    readonly requestTab = new Text(EWSQueryTerminalSelectors.RequestTab);
    readonly runRequestButton = new Text(EWSQueryTerminalSelectors.RunRequestButton);
    readonly stopRequestButton = new Text(EWSQueryTerminalSelectors.StopRequestButton);
    readonly saveRequestButton = new Text(EWSQueryTerminalSelectors.SaveRequestButton);
    readonly requestSwitch = new Text(EWSQueryTerminalSelectors.RequestSwitch);
    readonly responseTab = new Text(EWSQueryTerminalSelectors.ResponseTab);
    readonly responseClearButton = new Text(EWSQueryTerminalSelectors.ResponseClearButton);
    readonly responseSwitch = new Text(EWSQueryTerminalSelectors.ResponseSwitch);
    readonly responseCopyButton = new Text(EWSQueryTerminalSelectors.ResponseCopyButton);
    readonly requestInput = new Input(EWSQueryTerminalSelectors.RequestInput, false);
    readonly responseInput = new Input(EWSQueryTerminalSelectors.RequestInput, false);

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

    checkVisibleTab(): void {
        const selector = testSelector(EWSQueryTerminalSelectors.App);
        for (const value of tabItems) {
            cy.contains(selector, value);
        }
        this.historyTab.checkVisible();
        this.requestTab.checkVisible();
        this.responseTab.checkVisible();
    }

    setConfigRequest(random: string) {
        this.requestInput.checkEnabled();
        this.requestInput.clear();
        this.requestInput
            .get()
            .clear()
            .type(
                `{\n` +
                    `"type": "ExecCommand",\n` +
                    `"id": ${ERobots.Herodotus} ,\n` +
                    `"command": "UpdateConfig",\n` +
                    `"newConfigRaw": "<robot kind=\\"trading_tasks\\">\\n    </robot>\\n<!--${random} -->"`,
                { force: true, delay: 0 },
            );
    }

    setRequest(nameRequest: string) {
        this.requestInput.checkEnabled();
        this.requestInput.clear();
        this.requestInput.get().clear().type(`{"type": "${nameRequest}"}`, {
            force: true,
            delay: 0,
            parseSpecialCharSequences: false,
        });
    }

    setStartComponentRequest(nameRequest: string) {
        this.requestInput.checkEnabled();
        this.requestInput.clear();
        this.requestInput
            .get()
            .clear()
            .type(`{"type": "ExecCommand", "id": 1617, "command": "${nameRequest}"}`, {
                force: true,
                delay: 0,
                parseSpecialCharSequences: false,
            });
    }
}

export const wsQueryTerminalPage = new WSQueryTerminalPage();
