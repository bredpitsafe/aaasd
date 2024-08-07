import { createTestProps } from '../../../../index';

export enum EProductLogsTabSelectors {
    ProductLogsTab = 'productLogsTab',
}

export const ProductLogsTabProps = {
    [EProductLogsTabSelectors.ProductLogsTab]: createTestProps(
        EProductLogsTabSelectors.ProductLogsTab,
    ),
};
