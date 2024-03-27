import { createTestProps } from '../../../../index';

export enum EWSRequestTabSelectors {
    SendButton = 'sendButton',
    StopButton = 'stopButton',
    ClearButton = 'clearButton',
    CopyResponseButton = 'copyResponseButton',
    CopyTokenButton = 'copyTokenButton',
    TabSwitch = 'tabSwitch',
    TabForm = 'tabForm',
    RequestForm = '[class*="requestForm"]',
    ResponseForm = '[class*="responseForm"]',
    RequestInput = '[class*="requestForm"] [class*="inputarea"]',
    ResponseInput = '[class*="responseForm"] [class*="inputarea"]',
}

export const WSRequestTabProps = {
    [EWSRequestTabSelectors.SendButton]: createTestProps(EWSRequestTabSelectors.SendButton),
    [EWSRequestTabSelectors.StopButton]: createTestProps(EWSRequestTabSelectors.StopButton),
    [EWSRequestTabSelectors.ClearButton]: createTestProps(EWSRequestTabSelectors.ClearButton),
    [EWSRequestTabSelectors.CopyResponseButton]: createTestProps(
        EWSRequestTabSelectors.CopyResponseButton,
    ),
    [EWSRequestTabSelectors.CopyTokenButton]: createTestProps(
        EWSRequestTabSelectors.CopyTokenButton,
    ),
    [EWSRequestTabSelectors.TabSwitch]: createTestProps(EWSRequestTabSelectors.TabSwitch),
    [EWSRequestTabSelectors.TabForm]: createTestProps(EWSRequestTabSelectors.TabForm),
};
