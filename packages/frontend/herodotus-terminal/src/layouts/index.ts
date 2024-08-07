import type { TPageLayouts } from '@frontend/common/src/modules/layouts/data';

import { defaultLayout, EDefaultLayoutComponents } from './default';

export enum ELayoutIds {
    Default = 'Default',
}

export const DEFAULT_LAYOUTS: TPageLayouts = {
    [ELayoutIds.Default]: {
        id: ELayoutIds.Default,
        value: defaultLayout,
        version: 1,
    },
};

export const layoutComponents: string[] = Object.values(EDefaultLayoutComponents);
