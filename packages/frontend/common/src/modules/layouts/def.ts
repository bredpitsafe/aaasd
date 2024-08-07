import type { TPageLayouts } from './data.ts';
import { getSingleTabLayout } from './utils.ts';

export const DEFAULT_TAB_WEIGHT = 50;
export const MAX_TAB_WEIGHT = 100;

export enum EDefaultLayouts {
    SingleTab = 'SingleTab',
}

export const DEFAULT_LAYOUTS: TPageLayouts = {
    [EDefaultLayouts.SingleTab]: getSingleTabLayout(),
};
