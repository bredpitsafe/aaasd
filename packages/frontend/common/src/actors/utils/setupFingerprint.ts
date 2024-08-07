import { fingerprintPromise } from '../../utils/fingerprint.ts';
import { setLoggerSettings } from '../../utils/Tracing';
import { setupFingerprintEnvBox } from '../actions.ts';
import { sendLogEnvBox } from '../Metrics/actions.ts';

export function setupFingerprint(): void {
    fingerprintPromise.then((fingerprint) => {
        setupFingerprintEnvBox.send(null, fingerprint);

        setLoggerSettings({
            fingerprint,
            sendLog: sendLogEnvBox.send.bind(null, null),
        });
    });
}
