import { Milliseconds } from '../../types/time.ts';
import { createActorEnvelopeBox } from '../../utils/Actors';

export const publishHeartbeatEnvBox = createActorEnvelopeBox<Milliseconds>()('HEARTBEAT');
