import { createTestProps } from '../index';

export enum EModalSelectors {
    Modal = '[class=ant-modal-content]',
    CloseButton = '[class=ant-modal-close-x]',
    CancelButton = 'cancelButton',
    SaveButton = 'saveButton',
    SettingButton = '[class="anticon anticon-setting"]',
    DownloadLogsButton = 'downloadLogsButton',
    RestartAppButton = 'restartAppButton',
    NameComponentInput = 'nameComponentInput',
    TabsCoinFilterInput = 'tabsCoinFilterInput',
    RemoveTabsCoinFilterButton = '[data-test="tabsCoinFilterInput"] [class="ant-select-selection-item-remove"]',
}

export const EModalProps = {
    [EModalSelectors.NameComponentInput]: createTestProps(EModalSelectors.NameComponentInput),
    [EModalSelectors.TabsCoinFilterInput]: createTestProps(EModalSelectors.TabsCoinFilterInput),
};
