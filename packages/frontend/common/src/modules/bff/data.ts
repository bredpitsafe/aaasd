import { assertFail } from '@common/utils/src/assert.ts';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { combineLatest, map, shareReplay, switchMap } from 'rxjs';

import { loadConfig } from '../../effects/socketList.ts';
import type { TSocketName, TSocketStruct } from '../../types/domain/sockets.ts';
import { isDevelopment, isMultiStageDomain, isProductionDomain } from '../../utils/environment.ts';
import { isProdEnvironment } from '../../utils/url.ts';

export const BFF_PROD_SOCKET_NAME = 'bff-prod' as TSocketName;
export const BFF_MS_SOCKET_NAME = 'bff-ms' as TSocketName;
export const BFF_DEV_SOCKET_NAME = 'bff-dev' as TSocketName;
export const bffSocketsList$ = loadConfig('bff.urls.json').pipe(shareReplay(1));

export const getCurrentBffSocket$ = (
    currentSocket$: Observable<TSocketName | undefined>,
    requestStage$: Observable<TSocketName | undefined>,
): Observable<TSocketStruct> => {
    return bffSocketsList$.pipe(
        switchMap((list) => {
            return combineLatest([currentSocket$, requestStage$]).pipe(
                map(([bffSocketNameFromSettings, requestStage]) => {
                    const PROD = { name: BFF_PROD_SOCKET_NAME, url: list[BFF_PROD_SOCKET_NAME] };
                    const MS = { name: BFF_MS_SOCKET_NAME, url: list[BFF_MS_SOCKET_NAME] };
                    // If it's a production domain environment, choice should not be available.
                    // System should select BFF depending on `requestStage` if the param is present in the request,
                    // or reside to `bff-prod` by default.
                    if (isProductionDomain()) {
                        if (isNil(requestStage) || isProdEnvironment(requestStage)) {
                            return PROD;
                        }
                        return MS;
                    }

                    // If it's a Multi-Stage or dev environment, there should be a choice allowed for the user
                    // (it's mostly for dev builds, after all).
                    if (isMultiStageDomain() || isDevelopment()) {
                        if (
                            !isNil(bffSocketNameFromSettings) &&
                            bffSocketNameFromSettings in list
                        ) {
                            return {
                                name: bffSocketNameFromSettings,
                                url: list[bffSocketNameFromSettings],
                            };
                        }
                        // TODO: Change this to MS when real users are moved to prod domain
                        return PROD;
                    }

                    // Guard against special cases for any other domains and environments, should they arise at a later time.
                    assertFail();
                }),
            );
        }),
    );
};
