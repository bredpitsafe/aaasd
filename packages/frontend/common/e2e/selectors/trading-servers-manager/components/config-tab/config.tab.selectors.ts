import { createTestProps } from '../../../../index';

export enum EConfigTabSelectors {
    ApplyButton = 'applyButton',
    DiscardButton = 'discardButton',
    DiffButton = 'diffButton',
    ConfigList = 'configList',
    ConfigForm = 'configForm',
    RevisionsSelector = 'revisionsSelector',
    ConfigInput = '[data-test="configForm"] [class*="inputarea"]',
    RevisionsList = '[class*=ant-select-dropdown]',
    RevisionsInput = '[data-test=revisionsSelector] [class*="input"]',
    ServerConfigForm = '[class="editor original"]',
    EditedConfigForm = '[class="editor modified"]',
    ColorLine = '[class="cldr highlight-line-decoration"]',
    SaveIcon = '[class*="anticon anticon-save"]',
    RevisionsListItem = '[class="ant-select-item-option-content"]',
    ActiveRevisions = '[aria-selected="true"] [class="ant-select-item-option-content"]',
}

export const ConfigTabProps = {
    [EConfigTabSelectors.ApplyButton]: createTestProps(EConfigTabSelectors.ApplyButton),
    [EConfigTabSelectors.DiscardButton]: createTestProps(EConfigTabSelectors.DiscardButton),
    [EConfigTabSelectors.DiffButton]: createTestProps(EConfigTabSelectors.DiffButton),
    [EConfigTabSelectors.RevisionsSelector]: createTestProps(EConfigTabSelectors.RevisionsSelector),
    [EConfigTabSelectors.ConfigForm]: createTestProps(EConfigTabSelectors.ConfigForm),
};
