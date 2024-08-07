import { createTestProps } from '../../../../index';

export enum EDashboardsTabSelectors {
    DashboardLink = 'dashboardLink',
    DashboardLinkButton = 'dashboardLinkButton',
}

export const EDashboardsTabProps = {
    [EDashboardsTabSelectors.DashboardLink]: createTestProps(EDashboardsTabSelectors.DashboardLink),
    [EDashboardsTabSelectors.DashboardLinkButton]: createTestProps(
        EDashboardsTabSelectors.DashboardLinkButton,
    ),
};
