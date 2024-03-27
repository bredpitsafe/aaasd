import { ModuleFactory } from '../../di';
import { borrowChannel, receiveFromTabs } from '../../utils/Rx/syncBetweenTabs.ts';
import { TraceId } from '../../utils/traceId';
import { SharedWorker } from '../../workers/SharedWorker';

export const ModuleRestartApp = ModuleFactory(() => {
    const key = 'RELOAD_ALL_TABS';
    const restart = (traceId: TraceId) => {
        const channel = borrowChannel(key);

        SharedWorker.updateSessionId();
        void channel.postMessage(traceId);
        window.location.reload();
    };

    const listen = () => {
        const sub = receiveFromTabs(key).subscribe(() => {
            window.location.reload();
        });
        return () => sub.unsubscribe();
    };

    return {
        restart,
        listen,
    };
});
