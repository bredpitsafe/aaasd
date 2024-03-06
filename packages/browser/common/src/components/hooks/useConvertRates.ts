import { TStageName } from '@bhft/bff/src/def/stages.ts';
import { isEmpty, isNil } from 'lodash-es';
import memoize from 'memoizee';
import { useMemo } from 'react';
import { combineLatest, merge, of, Subject } from 'rxjs';
import { filter, map, scan, switchMap } from 'rxjs/operators';

import { useModule } from '../../di/react';
import { ModuleBaseActions } from '../../modules/actions';
import { ModuleBFF } from '../../modules/bff';
import { TConvertRateItem } from '../../modules/convertRates/def.ts';
import { ModuleFetchConvertRatesSnapshot } from '../../modules/convertRates/fetchConvertRatesSnapshot.ts';
import { ModuleSubscribeToConvertRates } from '../../modules/convertRates/subscribeToConvertRates.ts';
import { ModuleSocketPage } from '../../modules/socketPage';
import { EAssetName, TAsset } from '../../types/domain/asset';
import { TConvertRate } from '../../types/domain/convertRate';
import { ISO } from '../../types/time';
import { EMPTY_ARRAY } from '../../utils/const';
import { useSyncObservable } from '../../utils/React/useSyncObservable';
import { iso2nanoseconds } from '../../utils/time';
import { generateTraceId } from '../../utils/traceId';
import { UnifierWithCompositeHash } from '../../utils/unifierWithCompositeHash';
import { isSyncedValueDescriptor } from '../../utils/ValueDescriptor/utils.ts';

export function useConvertRate(
    baseAssetName: TAsset['name'] | TAsset['name'][],
    quoteAssetName: TAsset['name'] = EAssetName.USD,
): ReadonlyMap<TAsset['name'], TConvertRate> | undefined {
    const { currentSocketName$ } = useModule(ModuleSocketPage);
    const { getCurrentBFFSocket$ } = useModule(ModuleBFF);
    const { getSocketAssetsDedobsed$ } = useModule(ModuleBaseActions);
    const subscribeToConvertRates = useModule(ModuleSubscribeToConvertRates);
    const fetchConvertRatesSnapshot = useModule(ModuleFetchConvertRatesSnapshot);

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
                : combineLatest([getSocketAssetsDedobsed$(), bffSocket$, currentSocketName$]).pipe(
                      switchMap(([assets, bffSocket, requestStage]) => {
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
                                  requestStage: requestStage as unknown as TStageName,
                                  params: {},
                              },
                              { enableLogs: true, traceId: generateTraceId() },
                          ).pipe(
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
                                              // @ts-ignore
                                              hash.modify(envelope.payload.keys);
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
                                          requestStage: requestStage as unknown as TStageName,
                                      },
                                      { enableLogs: true, traceId: generateTraceId() },
                                  ),
                              ),
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
            getSocketAssetsDedobsed$,
            bffSocket$,
            currentSocketName$,
            cacheMap,
            quoteAssetName,
            subscribeToConvertRates,
            fetchConvertRatesSnapshot,
        ],
    );

    return useSyncObservable(convertRates$);
}

const getAssetNames = memoize((assetNames: TAsset['name'][]): TAsset['name'][] => assetNames, {
    primitive: false,
    max: 10,
    normalizer(args: Parameters<(assetNames: TAsset['name'][]) => TAsset['name'][]>): string {
        return [...args].sort().join(';');
    },
});
