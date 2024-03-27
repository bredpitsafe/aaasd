import { ModuleFactory } from '../../di';
import {
    boxServers,
    boxServersList,
    deleteServers,
    getServer,
    getServer$,
    getServersList,
    upsertServers,
} from './data';

function createModule() {
    return {
        servers$: boxServers.obs,
        getServer$,

        getServer,
        upsertServers,
        deleteServers,

        serversList$: boxServersList.obs,
        getServersList,
    };
}

export type IModuleServers = ReturnType<typeof createModule>;

export const ModuleServers = ModuleFactory(createModule);
