import { TAsset } from '@frontend/common/src/types/domain/asset';
import { TConvertRate } from '@frontend/common/src/types/domain/convertRate';
import { createContext } from 'react';

export const ConvertRatesContext = createContext<
    ReadonlyMap<TAsset['name'], TConvertRate> | undefined
>(undefined);
