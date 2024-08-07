import type { TStageName } from '@backend/bff/src/def/stages.ts';
import type { TDurationString } from '@backend/bff/src/utils/grpc.ts';
import type { ISO } from '@common/types';
import { generateTraceId, iso2nanoseconds } from '@common/utils';
import { isEmpty, isNil } from 'lodash-es';
import memoize from 'memoizee';
import { useMemo, useState } from 'react';
import { combineLatest, merge, of, Subject } from 'rxjs';
import { filter, map, scan, switchMap } from 'rxjs/operators';

import { useModule } from '../../di/react';
import { ModuleSubscribeToAssetsOnCurrentStage } from '../../modules/actions/dictionaries/ModuleSubscribeToAssetsOnCurrentStage.ts';
import { ModuleBFF } from '../../modules/bff';
import type { TConvertRateItem } from '../../modules/convertRates/def.ts';
import { ModuleFetchConvertRatesSnapshot } from '../../modules/convertRates/fetchConvertRatesSnapshot.ts';
import { ModuleSubscribeToConvertRates } from '../../modules/convertRates/subscribeToConvertRates.ts';
import { ModuleMock } from '../../modules/mock';
import { ModuleSocketPage } from '../../modules/socketPage';
import type { TAsset } from '../../types/domain/asset';
import { EAssetName } from '../../types/domain/asset';
import type { TConvertRate } from '../../types/domain/convertRate';
import { EMPTY_ARRAY } from '../../utils/const';
import { useSyncObservable } from '../../utils/React/useSyncObservable';
import { ModuleNotifyErrorAndFail } from '../../utils/Rx/ModuleNotify.ts';
import {
    extractSyncedValueFromValueDescriptor,
    tapValueDescriptor,
} from '../../utils/Rx/ValueDescriptor2.ts';
import { UnifierWithCompositeHash } from '../../utils/unifierWithCompositeHash';
import {
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
} from '../../utils/ValueDescriptor/utils.ts';

type TConvertRatesMap = ReadonlyMap<TAsset['name'], TConvertRate>;

export type TUseConvertRateReturnType = {
    convertRatesMap: TConvertRatesMap | undefined;
    loading: boolean;
};

export function useConvertRates(
    baseAssetName: TAsset['name'] | TAsset['name'][],
    quoteAssetName: TAsset['name'] = EAssetName.USD,
): TUseConvertRateReturnType {
    const { currentSocketName$ } = useModule(ModuleSocketPage);
    const notifyErrorAndFail = useModule(ModuleNotifyErrorAndFail);
    const { getCurrentBFFSocket$ } = useModule(ModuleBFF);
    const subscribeToAssets = useModule(ModuleSubscribeToAssetsOnCurrentStage);
    const subscribeToConvertRates = useModule(ModuleSubscribeToConvertRates);
    const fetchConvertRatesSnapshot = useModule(ModuleFetchConvertRatesSnapshot);
    const { mock$ } = useModule(ModuleMock);

    const [loading, setLoading] = useState(false);

    const cacheMap = useMemo(
        () => new UnifierWithCompositeHash<TConvertRate>(['baseAssetName']),
        [],
    );

    const baseAssetsArray = useMemo(
        () =>
            Array.isArray(baseAssetName)
                ? getAssetNames(baseAssetName)
                : isEmpty(baseAssetName)
                  ? (EMPTY_ARRAY as TAsset['name'][])
                  : getAssetNames([baseAssetName]),
        [baseAssetName],
    );

    const bffSocket$ = useMemo(() => getCurrentBFFSocket$(), [getCurrentBFFSocket$]);

    const convertRates$ = useMemo(
        () =>
            baseAssetsArray.length === 0
                ? of(undefined)
                : combineLatest([
                      subscribeToAssets(undefined, { traceId: generateTraceId() }).pipe(
                          extractSyncedValueFromValueDescriptor(),
                      ),
                      bffSocket$,
                      currentSocketName$,
                      mock$,
                  ]).pipe(
                      switchMap(([assets, bffSocket, requestStage, mock]) => {
                          const assetsMap = new Map(assets?.map((asset) => [asset.name, asset]));

                          const baseAssets = baseAssetsArray
                              .map((assetName) => assetsMap.get(assetName))
                              .filter((asset): asset is TAsset => !isNil(asset));

                          if (baseAssets.length === 0) {
                              return of(undefined);
                          }

                          const quoteAsset = assetsMap.get(quoteAssetName);

                          if (isNil(quoteAsset)) {
                              return of(undefined);
                          }

                          const filters = {
                              include: {
                                  baseAssetId: baseAssets.map((asset) => asset.id),
                                  quoteAssetId: quoteAsset.id,
                              },
                          };

                          const subscribed$ = new Subject<void>();
                          const subscribe$ = subscribeToConvertRates(
                              {
                                  type: 'SubscribeToConvertRates',
                                  target: bffSocket,
                                  filters,
                                  requestStage: requestStage as TStageName,
                                  params: {
                                      aggregation: {
                                          function: 'AGGREGATION_FUNCTION_UNSPECIFIED',
                                          interval: '1000' as TDurationString,
                                      },
                                  },
                                  mock,
                              },
                              { enableLogs: true, traceId: generateTraceId() },
                          ).pipe(
                              notifyErrorAndFail(),
                              tapValueDescriptor({
                                  unsynced: (vd) => {
                                      setLoading(isLoadingValueDescriptor(vd));
                                  },
                                  synced: () => {
                                      setLoading(false);
                                  },
                              }),
                              filter(isSyncedValueDescriptor),
                              map((desc) => desc.value),
                              scan(
                                  (hash, envelope, index) => {
                                      switch (envelope.payload.type) {
                                          case 'ConvertRatesSubscribed': {
                                              if (index > 0) {
                                                  hash.clear();
                                              }
                                              subscribed$.next();
                                              break;
                                          }
                                          case 'ConvertRatesUpdated': {
                                              hash.modify(envelope.payload.updates);
                                              break;
                                          }
                                          case 'ConvertRatesRemoved': {
                                              hash.modify(
                                                  envelope.payload.keys as TConvertRateItem[],
                                              );
                                              break;
                                          }
                                      }

                                      return hash;
                                  },
                                  new UnifierWithCompositeHash<TConvertRateItem>(
                                      ['baseAssetId', 'quoteAssetId'],
                                      { removePredicate: (item) => isNil(item.rate) },
                                  ),
                              ),
                              map((hash) => hash.toArray()),
                          );

                          const fetch$ = subscribed$.pipe(
                              switchMap(() =>
                                  fetchConvertRatesSnapshot(
                                      {
                                          type: 'FetchConvertRatesSnapshot',
                                          target: bffSocket,
                                          filters,
                                          requestStage: requestStage as TStageName,
                                          mock,
                                      },
                                      { enableLogs: true, traceId: generateTraceId() },
                                  ),
                              ),
                              tapValueDescriptor({
                                  unsynced: (vd) => {
                                      setLoading(isLoadingValueDescriptor(vd));
                                  },
                                  synced: () => {
                                      setLoading(false);
                                  },
                              }),
                              notifyErrorAndFail(),
                              filter(isSyncedValueDescriptor),
                              map((desc) => desc.value),
                              map((envelope) => envelope.payload.snapshot),
                          );

                          return merge(fetch$, subscribe$).pipe(
                              map((items) => {
                                  if (isNil(items)) {
                                      return;
                                  }

                                  return items.map((item) => {
                                      const baseAsset = baseAssets.find(
                                          (a) => a.id === item.baseAssetId,
                                      );

                                      return {
                                          ...item,
                                          baseAssetName: baseAsset?.name ?? '',
                                          quoteAssetName: quoteAsset.name,
                                          platformTime: iso2nanoseconds(item.platformTime as ISO),
                                      };
                                  });
                              }),
                          );
                      }),
                      scan((acc, items) => {
                          if (!isNil(items)) {
                              acc.clear();
                              acc.modify(items);
                          }

                          return acc;
                      }, cacheMap),
                      map((hash) => new Map(hash.getMap())),
                  ),
        [
            baseAssetsArray,
            subscribeToAssets,
            bffSocket$,
            currentSocketName$,
            mock$,
            cacheMap,
            quoteAssetName,
            subscribeToConvertRates,
            notifyErrorAndFail,
            fetchConvertRatesSnapshot,
        ],
    );

    const convertRatesMap = useSyncObservable(convertRates$);
    return useMemo(
        () => ({
            convertRatesMap,
            loading,
        }),
        [convertRatesMap, loading],
    );
}

const getAssetNames = memoize((assetNames: TAsset['name'][]): TAsset['name'][] => assetNames, {
    primitive: false,
    max: 10,
    normalizer(args: Parameters<(assetNames: TAsset['name'][]) => TAsset['name'][]>): string {
        return [...args].sort().join(';');
    },
});
