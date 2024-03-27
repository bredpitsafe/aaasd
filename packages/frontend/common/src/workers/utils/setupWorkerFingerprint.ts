import { take } from 'rxjs/operators';
import { EnvelopeDispatchTarget, EnvelopeSubscribeSource } from 'webactor';

import { setupFingerprintEnvBox } from '../../actors/actions';
import { sendLogEnvBox } from '../../actors/Handlers/actions';
import { setLoggerSettings } from '../../utils/Tracing';

export function setupWorkerFingerprint(
    root: EnvelopeSubscribeSource & EnvelopeDispatchTarget,
): void {
    setupFingerprintEnvBox
        .as$(root)
        .pipe(take(1))
        .subscribe(({ payload }) => {
            setLoggerSettings({
                fingerprint: payload,
                sendLog: sendLogEnvBox.send.bind(null, root),
            });
        });
}
