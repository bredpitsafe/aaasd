import type { Nanoseconds } from '@common/types';

import type { TAsset } from './asset';

export type TConvertRate = {
    platformTime: Nanoseconds | null;
    baseAssetId: TAsset['id'];
    baseAssetName: TAsset['name'];
    quoteAssetId: TAsset['id'];
    quoteAssetName: TAsset['name'];
    rate: number;
};
