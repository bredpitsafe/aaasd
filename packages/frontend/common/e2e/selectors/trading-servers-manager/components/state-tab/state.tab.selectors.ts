import { createTestProps } from '../../../../index';

export enum EStateTabSelectors {
    ApplyButton = 'applyButton',
    DiscardButton = 'discardButton',
    DiffButton = 'diffButton',
    RevisionsSelector = 'revisionsSelector',
    StateForm = 'stateForm',
    SaveIcon = '[class*="anticon anticon-save"]',
    StateInput = '[data-test="stateForm"] [class*="inputarea"]',
    ServerStateForm = '[class="editor original"]',
    EditedStateForm = '[class="editor modified"]',
    ActiveRevisions = '[aria-selected="true"] [class="ant-select-item-option-content"]',
    RevisionsListItem = '[class="ant-select-item-option-content"]',
}

export const StateTabProps = {
    [EStateTabSelectors.ApplyButton]: createTestProps(EStateTabSelectors.ApplyButton),
    [EStateTabSelectors.DiscardButton]: createTestProps(EStateTabSelectors.DiscardButton),
    [EStateTabSelectors.DiffButton]: createTestProps(EStateTabSelectors.DiffButton),
    [EStateTabSelectors.RevisionsSelector]: createTestProps(EStateTabSelectors.RevisionsSelector),
    [EStateTabSelectors.StateForm]: createTestProps(EStateTabSelectors.StateForm),
};
