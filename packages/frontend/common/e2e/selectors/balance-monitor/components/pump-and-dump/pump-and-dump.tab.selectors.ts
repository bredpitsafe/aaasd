import { createTestProps } from '../../../../index';

export enum EPumpAndDumpTabSelectors {
    PumpAndDumpTab = 'pumpAndDumpTab',
    PumpAndDumpTabFilter = '[data-test="pumpAndDumpTab"] [class*="ag-icon-filter"]',
}

export const PumpAndDumpTabProps = {
    [EPumpAndDumpTabSelectors.PumpAndDumpTab]: createTestProps(
        EPumpAndDumpTabSelectors.PumpAndDumpTab,
    ),
};
