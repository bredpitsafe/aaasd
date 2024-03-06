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
}

export const EModalProps = {
    [EModalSelectors.NameComponentInput]: createTestProps(EModalSelectors.NameComponentInput),
};
