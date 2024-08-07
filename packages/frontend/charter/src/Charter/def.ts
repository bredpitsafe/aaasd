import { POINT_ITEM_SIZE } from '../../lib/Parts/def';
import type { IContext, TContextState, TGap } from '../types';
import { MAX_TEXTURE_SIZE } from '../utils/detect';

const MAX_PART_SIZE = 256;
export const MAX_PART_BUFFER_LENGTH = MAX_PART_SIZE * POINT_ITEM_SIZE;
export const MAX_CHART_PARTS_COUNT = 256;
export const MAX_CHARTS_COUNT = Math.floor(MAX_TEXTURE_SIZE / MAX_CHART_PARTS_COUNT);
export const DEFAULT_REQUESTED_PIXELS_COUNT = 2048;
export const DEFAULT_GAP: TGap = {
    t: 0,
    r: 0,
    b: 22,
    l: 1,
};

export interface ICharter {
    ctx: IContext;
    destroy: VoidFunction;
    getState: () => TContextState;
}
