import { createTestProps } from '../../index';

export enum EDashboardEditModal {
    ChartsForm = 'chartsForm',
    ApplyChartsButton = 'applyChartsButton',
    DiscardChartsButton = 'discardChartsButton',
    PanelPlusIconButton = '[data-icon="plus-circle"]',
    InputQueryPanel = '[col-id="query"] [class*="ant-input-affix-wrapper"]',
}

export const DashboardEditModalProps = {
    [EDashboardEditModal.ChartsForm]: createTestProps(EDashboardEditModal.ChartsForm),
    [EDashboardEditModal.ApplyChartsButton]: createTestProps(EDashboardEditModal.ApplyChartsButton),
    [EDashboardEditModal.DiscardChartsButton]: createTestProps(
        EDashboardEditModal.DiscardChartsButton,
    ),
};
