import { ModuleFactory, TContextRef } from '../../di';
import type { TSocketName } from '../../types/domain/sockets';
import { assert } from '../../utils/assert';
import { ModuleCommunicationHandlersRemoted } from '../communicationRemoteHandlers';
import { ModuleSocketList } from '../socketList';
import { ModuleSocketPage } from '../socketPage';

export function createModule(ctx: TContextRef) {
    const socketList = ModuleSocketList(ctx);
    const socketPage = ModuleSocketPage(ctx);
    const remoteHandlers = ModuleCommunicationHandlersRemoted(ctx);

    return {
        ...socketList,
        ...remoteHandlers,
        currentSocketUrl$: socketPage.currentSocketUrl$,
        currentSocketName$: socketPage.currentSocketName$,
        getCurrentSocketUrl: () => socketPage.getCurrentSocket()?.url,
        getCurrentSocketName: () => socketPage.getCurrentSocket()?.name,
        setCurrentSocketName: (name: TSocketName) => {
            const url = socketList.getSocket(name);
            assert(url !== undefined, `Socket with name "${name}" not found`);
            socketPage.setCurrentSocket(name, url);
        },
    };
}

export type IModuleCommunicationRemoted = ReturnType<typeof createModule>;

export const ModuleCommunicationRemoted = ModuleFactory(createModule);
