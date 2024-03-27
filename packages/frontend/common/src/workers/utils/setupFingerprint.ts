import { EnvelopeDispatchTarget } from 'webactor';

import { setupFingerprintEnvBox } from '../../actors/actions';
import { sendLogEnvBox } from '../../actors/Handlers/actions';
import { fingerprintPromise } from '../../utils/fingerprint';
import { setLoggerSettings } from '../../utils/Tracing';

export function setupFingerprint(root: EnvelopeDispatchTarget): void {
    fingerprintPromise.then((fingerprint) => {
        setupFingerprintEnvBox.send(root, fingerprint);

        setLoggerSettings({
            fingerprint,
            sendLog: sendLogEnvBox.send.bind(null, root),
        });
    });
}
