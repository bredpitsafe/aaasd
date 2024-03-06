import { createTestProps } from '../../../../index';

export enum ESuggestedTransfersTabSelectors {
    SuggestedTransfersTab = 'suggestedTransfersTab',
    SendButton = 'sendButton',
    ResetButton = 'resetButton',
}

export const SuggestedTransfersTabProps = {
    [ESuggestedTransfersTabSelectors.SuggestedTransfersTab]: createTestProps(
        ESuggestedTransfersTabSelectors.SuggestedTransfersTab,
    ),
    [ESuggestedTransfersTabSelectors.SendButton]: createTestProps(
        ESuggestedTransfersTabSelectors.SendButton,
    ),
    [ESuggestedTransfersTabSelectors.ResetButton]: createTestProps(
        ESuggestedTransfersTabSelectors.ResetButton,
    ),
};
