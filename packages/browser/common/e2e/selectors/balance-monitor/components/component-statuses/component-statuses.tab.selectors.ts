import { createTestProps } from '../../../../index';

export enum EComponentStatusesTabSelectors {
    ComponentStatusesTab = 'componentStatusesTab',
}

export const ComponentStatusesTabProps = {
    [EComponentStatusesTabSelectors.ComponentStatusesTab]: createTestProps(
        EComponentStatusesTabSelectors.ComponentStatusesTab,
    ),
};
