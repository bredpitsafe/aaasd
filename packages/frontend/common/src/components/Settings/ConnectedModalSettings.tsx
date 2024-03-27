import { memo } from 'react';

import { useModule } from '../../di/react';
import { ModuleLogger } from '../../modules/logger';
import { fingerprintPromise, TFingerprint } from '../../utils/fingerprint';
import { useSyncPromise } from '../../utils/React/useSyncPromise';
import { SettingsModal, TSettingsModalProps } from './SettingsModal';

export type TConnectedModalSettingsProps = TSettingsModalProps;

export const ConnectedModalSettings = memo((props: TConnectedModalSettingsProps) => {
    const { saveLogs } = useModule(ModuleLogger);
    const fingerprint = useSyncPromise(fingerprintPromise, '' as TFingerprint);

    return (
        <SettingsModal
            buildNumber={process.env.npm_package_version}
            fingerprint={fingerprint}
            onDownloadLogs={saveLogs}
            {...props}
        />
    );
});
