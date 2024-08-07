import { createTestProps } from '../../index';

export enum EWSQueryTerminalSelectors {
    App = 'appWSQueryTerminal',
    HistoryTab = 'historyTab',
    ClearUnsavedButton = 'clearUnsavedButton',
    RequestTab = 'requestTab',
    RunRequestButton = 'runRequestButton',
    StopRequestButton = 'stopRequestButton',
    SaveRequestButton = 'saveRequestButton',
    RequestSwitch = 'requestSwitch',
    RequestInput = '[data-test="requestTab"] [class*="inputarea"]',
    ResponseTab = 'responseTab',
    ResponseClearButton = 'responseClearButton',
    ResponseSwitch = 'responseSwitch',
    ResponseCopyButton = 'responseCopyButton',
    ResponseInput = '[data-test="responseTab"] [class*="inputarea"]',
}
export const EWSQueryTerminalPageProps = {
    [EWSQueryTerminalSelectors.App]: createTestProps(EWSQueryTerminalSelectors.App),
    [EWSQueryTerminalSelectors.HistoryTab]: createTestProps(EWSQueryTerminalSelectors.HistoryTab),
    [EWSQueryTerminalSelectors.ClearUnsavedButton]: createTestProps(
        EWSQueryTerminalSelectors.ClearUnsavedButton,
    ),
    [EWSQueryTerminalSelectors.RequestTab]: createTestProps(EWSQueryTerminalSelectors.RequestTab),
    [EWSQueryTerminalSelectors.RunRequestButton]: createTestProps(
        EWSQueryTerminalSelectors.RunRequestButton,
    ),
    [EWSQueryTerminalSelectors.StopRequestButton]: createTestProps(
        EWSQueryTerminalSelectors.StopRequestButton,
    ),
    [EWSQueryTerminalSelectors.SaveRequestButton]: createTestProps(
        EWSQueryTerminalSelectors.SaveRequestButton,
    ),
    [EWSQueryTerminalSelectors.RequestSwitch]: createTestProps(
        EWSQueryTerminalSelectors.RequestSwitch,
    ),
    [EWSQueryTerminalSelectors.ResponseTab]: createTestProps(EWSQueryTerminalSelectors.ResponseTab),
    [EWSQueryTerminalSelectors.ResponseClearButton]: createTestProps(
        EWSQueryTerminalSelectors.ResponseClearButton,
    ),
    [EWSQueryTerminalSelectors.ResponseSwitch]: createTestProps(
        EWSQueryTerminalSelectors.ResponseSwitch,
    ),
    [EWSQueryTerminalSelectors.ResponseCopyButton]: createTestProps(
        EWSQueryTerminalSelectors.ResponseCopyButton,
    ),
};
