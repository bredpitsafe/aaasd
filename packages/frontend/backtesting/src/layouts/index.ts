import { ECommonComponents } from '@frontend/common/src/modules/layouts';
import type { TPageLayouts } from '@frontend/common/src/modules/layouts/data';
import { without } from 'lodash-es';

import { defaultLayout, EDefaultLayoutComponents } from './default';

export enum ELayoutIds {
    Default = 'Default',
}

export const DEFAULT_LAYOUTS: TPageLayouts = {
    [ELayoutIds.Default]: {
        id: ELayoutIds.Default,
        value: defaultLayout,
        version: 6,
    },
};

export const layoutComponents: string[] = without<string>(
    Object.values(EDefaultLayoutComponents),
    EDefaultLayoutComponents.Tasks,
    ECommonComponents.AddTask,
    EDefaultLayoutComponents.RobotDashboard,
    EDefaultLayoutComponents.IndicatorsDashboard,
);
