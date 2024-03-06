import { ModuleFactory } from '../../di';
import { TraceId } from '../../utils/traceId';
import { SharedWorker } from '../../workers/SharedWorker';
import { ModuleReloadAllTabs } from './ModuleReloadAllTabs';

export const ModuleRestartApp = ModuleFactory((ctx) => {
    const reloadAllTabs = ModuleReloadAllTabs(ctx);

    return (traceId: TraceId) => {
        SharedWorker.updateSessionId();
        reloadAllTabs(undefined, { traceId }).subscribe();
    };
});
