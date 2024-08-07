import { assert } from '@common/utils/src/assert.ts';
import { EMPTY, switchMap } from 'rxjs';
import { shareReplay, throttleTime } from 'rxjs/operators';

import type { TContextRef } from '../../di';
import { ModuleFactory } from '../../di';
import type { TSocketName } from '../../types/domain/sockets';
import { ModuleCommunicationHandlers } from '../communicationHandlers';
import { ModuleSocketList } from '../socketList';
import { ModuleSocketPage } from '../socketPage';
import { ModuleSocketServerTime } from '../socketServerTime';

/**
 * @deprecated
 */
export function createCommunicationModule(ctx: TContextRef) {
    const socketList = ModuleSocketList(ctx);
    const socketPage = ModuleSocketPage(ctx);
    const handlers = ModuleCommunicationHandlers(ctx);
    const { getServerTime$, getServerIncrement$ } = ModuleSocketServerTime(ctx);

    return {
        ...handlers,
        ...socketList,

        currentSocketUrl$: socketPage.currentSocketUrl$,
        currentSocketName$: socketPage.currentSocketName$,
        getCurrentSocketUrl: () => socketPage.getCurrentSocket()?.url,
        getCurrentSocketName: () => socketPage.getCurrentSocket()?.name,
        setCurrentSocketName: (name: TSocketName) => {
            const url = socketList.getSocket(name);
            assert(url !== undefined, `Socket with name "${name}" not found`);
            socketPage.setCurrentSocket(name, url);
        },
        serverTime$: socketPage.currentSocketUrl$.pipe(
            switchMap((url) => (url ? getServerTime$(url) : EMPTY)),
            shareReplay(1),
        ),
        serverIncrement$: socketPage.currentSocketUrl$.pipe(
            switchMap((url) => (url ? getServerIncrement$(url) : EMPTY)),
            throttleTime(1_000),
            shareReplay(1),
        ),
    };
}

/**
 * @deprecated
 */
export type IModuleCommunication = Awaited<ReturnType<typeof createCommunicationModule>>;

/**
 * @deprecated
 */
export const ModuleCommunication = ModuleFactory(createCommunicationModule);
