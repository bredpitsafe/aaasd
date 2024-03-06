import { firstValueFrom, Observable, toArray } from 'rxjs';
import { map } from 'rxjs/operators';

import { pullLogsEnvBox } from '../../actors/actions';
import { TContextRef } from '../../di';
import { ModuleMessages } from '../../lib/messages';
import { saveAsJSON } from '../../utils/fileSaver';
import { macroTasks } from '../../utils/TasksScheduler/macroTasks';
import { getLogs } from '../../utils/Tracing';
import { TLogEventData } from '../../utils/Tracing/def';
import { IModuleActor, ModuleActor } from '../actor';

export function saveLogs(ctx: TContextRef) {
    const actor = ModuleActor(ctx);
    const messages = ModuleMessages(ctx);

    const stopLoading = messages.loading('Collect logs...');

    return firstValueFrom(pullLogs$(actor)).then((actorLogs) => {
        const logs = getLogs()
            .concat(actorLogs)
            .sort((a, b) => b.timestamp - a.timestamp);

        stopLoading();

        saveAsJSON(logs, `frontend_logs_${new Date()}`, {
            pretty: true,
        });
    });
}

function pullLogs$(actor: IModuleActor) {
    return new Observable<TLogEventData[]>((subscriber) => {
        const requestSub = pullLogsEnvBox.request(actor, undefined).subscribe(subscriber);
        const autoCloseDispose = macroTasks.addTimeout(() => {
            subscriber.complete();
        }, 1000);

        return () => {
            autoCloseDispose();
            requestSub.unsubscribe();
        };
    }).pipe(
        toArray(),
        map((nested) => nested.flat()),
    );
}
