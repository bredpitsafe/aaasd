import { isNil } from 'lodash-es';
import { first, firstValueFrom, shareReplay } from 'rxjs';

import { ModuleFactory } from '../../../di';
import { isProduction } from '../../../utils/environment.ts';
import { ModuleCommunicationHandlers } from '../../communicationHandlers';
import { ModuleSocketList } from '../../socketList';
import { SOCKET_STAR_NAME } from '../../socketList/defs.ts';
import type { TMetric } from './defs.ts';

export type TSendBody = {
    type: 'PublishMetrics';
    metrics: TMetric[];
};

export const ModuleSendMetrics = ModuleFactory((ctx) => {
    const { getSocket$ } = ModuleSocketList(ctx);
    const socket$ = getSocket$(SOCKET_STAR_NAME).pipe(
        first((v) => !isNil(v)),
        shareReplay(1),
    );
    const { update } = ModuleCommunicationHandlers(ctx);

    return (metrics: TMetric[]) => {
        if (!isProduction()) {
            return;
        }

        socket$.subscribe((url) =>
            firstValueFrom(
                update<TSendBody, {}>(
                    url,
                    {
                        type: 'PublishMetrics',
                        metrics,
                    },
                    {
                        enableLogs: false,
                        waitForResponse: false,
                        skipAuthentication: true,
                    },
                ),
                { defaultValue: undefined },
            ),
        );
    };
});
