import { createActor } from '../../utils/Actors';
import { EActorName } from '../Root/defs';
import { sendHeartbeat, sendHeartbeatEnvBox } from './actions';

export function createActorHeartbeat() {
    return createActor(EActorName.Heartbeat, (context) => {
        sendHeartbeatEnvBox.responseStream(context, sendHeartbeat);
    });
}
