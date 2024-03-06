import { createTestProps } from '../../../../index';

export enum ESendDataToAnalyseTabSelectors {
    SendDataTab = 'sendDataTab',
    CoinSelector = 'cinSelector',
    CommentInput = 'commentInput',
    ClearButton = 'clearButton',
    SendButton = 'sendButton',
}

export const SendDataToAnalyseTabProps = {
    [ESendDataToAnalyseTabSelectors.SendDataTab]: createTestProps(
        ESendDataToAnalyseTabSelectors.SendDataTab,
    ),
    [ESendDataToAnalyseTabSelectors.CoinSelector]: createTestProps(
        ESendDataToAnalyseTabSelectors.CoinSelector,
    ),
    [ESendDataToAnalyseTabSelectors.CommentInput]: createTestProps(
        ESendDataToAnalyseTabSelectors.CommentInput,
    ),
    [ESendDataToAnalyseTabSelectors.ClearButton]: createTestProps(
        ESendDataToAnalyseTabSelectors.ClearButton,
    ),
    [ESendDataToAnalyseTabSelectors.SendButton]: createTestProps(
        ESendDataToAnalyseTabSelectors.SendButton,
    ),
};
