import { interval } from 'rxjs';

import { createActor } from '../../utils/Actors';
import { getNowMilliseconds } from '../../utils/time.ts';
import { EActorName } from '../Root/defs';
import { publishHeartbeatEnvBox } from './actions';
import { WORKER_HEARTBEAT_INTERVAL } from './def.ts';

export function createActorHeartbeat() {
    return createActor(EActorName.Heartbeat, (context) => {
        const sub = interval(WORKER_HEARTBEAT_INTERVAL).subscribe(() =>
            publishHeartbeatEnvBox.send(context, getNowMilliseconds()),
        );

        return () => sub.unsubscribe();
    });
}
