import { first } from 'rxjs';

import { ModuleFactory } from '../../di';
import { sendLogsEventHandle, TPublishLog } from '../../handlers/sendLogsEventHandle';
import { ModuleCommunicationHandlers } from '../communicationHandlers';
import { ModuleSocketList } from '../socketList';
import { SOCKET_STAR_NAME } from '../socketList/defs';

export const ModuleSendLog = ModuleFactory((ctx) => {
    const { getSocket$ } = ModuleSocketList(ctx);
    const { update } = ModuleCommunicationHandlers(ctx);

    const socket$ = getSocket$(SOCKET_STAR_NAME).pipe(first((v) => v !== undefined));

    return (log: TPublishLog) => {
        socket$.subscribe((url) => sendLogsEventHandle(update, url, log));
    };
});
