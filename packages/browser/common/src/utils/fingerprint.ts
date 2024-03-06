import { load } from '@fingerprintjs/fingerprintjs';

import { Opaque } from '../types';
import { logger } from './Tracing';

export type TFingerprint = Opaque<'Fingerprint', string>;

export let fingerprint = '' as TFingerprint;
export const fingerprintPromise = load({ monitoring: false })
    .then((agent) => agent.get())
    .then(({ visitorId }) => (fingerprint = visitorId as TFingerprint));

fingerprintPromise.then((fingerprint) => logger.info('Fingerprint =', fingerprint));
