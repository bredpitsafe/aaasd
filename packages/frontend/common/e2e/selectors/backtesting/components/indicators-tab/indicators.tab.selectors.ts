import { createTestProps } from '../../../../index';

export enum EIndicatorsTabSelectors {
    IndicatorsTab = 'indicatorsTab',
}

export const IndicatorsTabProps = {
    [EIndicatorsTabSelectors.IndicatorsTab]: createTestProps(EIndicatorsTabSelectors.IndicatorsTab),
};
