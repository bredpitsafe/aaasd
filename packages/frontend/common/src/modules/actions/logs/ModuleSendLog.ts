import { isNil } from 'lodash-es';
import { first, firstValueFrom, shareReplay } from 'rxjs';

import { ModuleFactory } from '../../../di';
import { isProduction } from '../../../utils/environment.ts';
import { ModuleCommunicationHandlers } from '../../communicationHandlers';
import { ModuleSocketList } from '../../socketList';
import { SOCKET_STAR_NAME } from '../../socketList/defs.ts';
import type { TPublishLog } from './defs.ts';

type TSendBody = { type: 'PublishLogEvent' } & TPublishLog;

export const ModuleSendLog = ModuleFactory((ctx) => {
    const { getSocket$ } = ModuleSocketList(ctx);
    const { update } = ModuleCommunicationHandlers(ctx);

    const socket$ = getSocket$(SOCKET_STAR_NAME).pipe(
        first((v) => !isNil(v)),
        shareReplay(1),
    );

    return (log: TPublishLog) => {
        if (!isProduction()) {
            return;
        }

        socket$.subscribe((url) =>
            firstValueFrom(
                update<TSendBody, {}>(
                    url,
                    {
                        type: 'PublishLogEvent',
                        ...log,
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
