import { TContextRef } from '@frontend/common/src/di';
import { getPortfolioDebugInfo } from '@frontend/common/src/modules/actions/portfolioTracker/getPortfolioDebugInfo$';
import { ModuleCommunicationHandlers } from '@frontend/common/src/modules/communicationHandlers';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { TSocketName, TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { saveAsString } from '@frontend/common/src/utils/fileSaver';
import { TraceId } from '@frontend/common/src/utils/traceId';
import { combineLatest, first, firstValueFrom, switchMap, tap } from 'rxjs';

import { ModulePortfolioTrackerObservables } from '../observables/module';
import { TActiveBooks } from '../router/def';

export function downloadCurrentPortfolioDebugInfo$(ctx: TContextRef, traceId: TraceId) {
    const { error } = ModuleNotifications(ctx);
    const { request } = ModuleCommunicationHandlers(ctx);
    const { activeBookIds$ } = ModulePortfolioTrackerObservables(ctx);
    const { currentSocketName$, currentSocketUrl$ } = ModuleSocketPage(ctx);

    return firstValueFrom(
        combineLatest({
            ids: activeBookIds$,
            url: currentSocketUrl$,
            stage: currentSocketName$,
        }).pipe(
            first(
                (props): props is { ids: TActiveBooks; url: TSocketURL; stage: TSocketName } =>
                    props.stage !== undefined && props.url !== undefined && props.ids !== undefined,
            ),
            switchMap(({ ids, url, stage }) => {
                return getPortfolioDebugInfo({ fetch: request, errorNotify: error }, url, ids, {
                    traceId,
                }).pipe(
                    tap((data) => {
                        saveAsString(
                            JSON.stringify(data.trades, null, 4),
                            `DEBUG_INFO__${ids.join(',')}__${stage}__${new Date()}`,
                            'json',
                        );
                    }),
                );
            }),
        ),
    );
}
