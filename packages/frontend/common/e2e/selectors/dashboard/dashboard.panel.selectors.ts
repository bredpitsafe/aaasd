import { createTestProps } from '../../index';

export enum EDashboardPanelSelectors {
    PanelButton = 'panelButton',
    PanelViewButton = 'panelViewButton',
    PanelConfigButton = 'panelConfigButton',
    PanelChartsButton = 'panelChartsButton',
    PanelEditButton = 'panelEditButton',
    PanelHoldDragButton = 'panelHoldDragButton',
    PanelSettingsButton = 'panelSettingsButton',
    PanelFullscreenButton = 'panelFullscreenButton',
    PanelShowLegendButton = 'panelShowLegendButton',
    PanelDeleteButton = 'panelDeleteButton',
    PanelInput = '[data-test=dashboardCard] [class*="inputarea"]',
}

export const EDashboardPanelProps = {
    [EDashboardPanelSelectors.PanelButton]: createTestProps(EDashboardPanelSelectors.PanelButton),
    [EDashboardPanelSelectors.PanelViewButton]: createTestProps(
        EDashboardPanelSelectors.PanelViewButton,
    ),
    [EDashboardPanelSelectors.PanelConfigButton]: createTestProps(
        EDashboardPanelSelectors.PanelConfigButton,
    ),
    [EDashboardPanelSelectors.PanelChartsButton]: createTestProps(
        EDashboardPanelSelectors.PanelChartsButton,
    ),
    [EDashboardPanelSelectors.PanelEditButton]: createTestProps(
        EDashboardPanelSelectors.PanelEditButton,
    ),
    [EDashboardPanelSelectors.PanelHoldDragButton]: createTestProps(
        EDashboardPanelSelectors.PanelHoldDragButton,
    ),
    [EDashboardPanelSelectors.PanelSettingsButton]: createTestProps(
        EDashboardPanelSelectors.PanelSettingsButton,
    ),
    [EDashboardPanelSelectors.PanelFullscreenButton]: createTestProps(
        EDashboardPanelSelectors.PanelFullscreenButton,
    ),
    [EDashboardPanelSelectors.PanelShowLegendButton]: createTestProps(
        EDashboardPanelSelectors.PanelShowLegendButton,
    ),
    [EDashboardPanelSelectors.PanelDeleteButton]: createTestProps(
        EDashboardPanelSelectors.PanelDeleteButton,
    ),
};
