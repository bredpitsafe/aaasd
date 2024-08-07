import { createTestProps } from '../index';

export enum EModalSelectors {
    Modal = '[class=ant-modal-content]',
    CloseButton = '[class=ant-modal-close-x]',
    CancelButton = 'cancelButton',
    SaveButton = 'saveButton',
    DownloadLogsButton = 'downloadLogsButton',
    RestartAppButton = 'restartAppButton',
    NameComponentInput = 'nameComponentInput',
    TabsCoinFilterInput = 'tabsCoinFilterInput',
    ExcludedStrategiesFilterInput = 'excludedStrategiesFilterInput',
    BFFStageSelector = 'bffStageSelector',
    ServiceStageSelector = 'serviceStageSelector',
    RemoveButton = '[class*="remove"]',
    CheckedSelectRow = '[class="rc-virtual-list"] [aria-label="check"]',
}

export const EModalProps = {
    [EModalSelectors.NameComponentInput]: createTestProps(EModalSelectors.NameComponentInput),
    [EModalSelectors.TabsCoinFilterInput]: createTestProps(EModalSelectors.TabsCoinFilterInput),
    [EModalSelectors.ExcludedStrategiesFilterInput]: createTestProps(
        EModalSelectors.ExcludedStrategiesFilterInput,
    ),
    [EModalSelectors.BFFStageSelector]: createTestProps(EModalSelectors.BFFStageSelector),
    [EModalSelectors.ServiceStageSelector]: createTestProps(EModalSelectors.ServiceStageSelector),
};
