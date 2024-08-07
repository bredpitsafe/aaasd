import type { Opaque } from '@common/types';
import { load } from '@fingerprintjs/fingerprintjs';

import { logger } from './Tracing';
import { Binding } from './Tracing/Children/Binding.ts';

export type TFingerprint = Opaque<'Fingerprint', string>;

export let fingerprint = '' as TFingerprint;
const fingerprintLogger = logger.child(new Binding('Fingerprint'));

fingerprintLogger.info('start loading');
export const fingerprintPromise = load({ monitoring: false })
    .then((agent) => {
        fingerprintLogger.info('agent initialized');
        return agent.get();
    })
    .then(({ visitorId }) => {
        fingerprint = visitorId as TFingerprint;
        fingerprintLogger.info('acquired', { fingerprint });
        return fingerprint;
    });
