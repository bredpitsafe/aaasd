import { memo } from 'react';

import { useModule } from '../../di/react';
import { useSession } from '../../hooks/session/useSession.ts';
import { useSessionUser } from '../../hooks/session/useSessionUser.ts';
import { ModuleLogger } from '../../modules/logger';
import { ModuleSocketPage } from '../../modules/socketPage';
import type { TFingerprint } from '../../utils/fingerprint';
import { fingerprintPromise } from '../../utils/fingerprint';
import { useSyncObservable } from '../../utils/React/useSyncObservable.ts';
import { useSyncPromise } from '../../utils/React/useSyncPromise';
import type { TSettingsModalProps } from './SettingsModal';
import { SettingsModal } from './SettingsModal';

export type TConnectedModalSettingsProps = TSettingsModalProps;

export const ConnectedModalSettings = memo((props: TConnectedModalSettingsProps) => {
    const { saveLogs } = useModule(ModuleLogger);
    const { currentSocketName$ } = useModule(ModuleSocketPage);
    const fingerprint = useSyncPromise(fingerprintPromise, '' as TFingerprint);

    const user = useSessionUser();
    const session = useSession();
    const socketName = useSyncObservable(currentSocketName$);

    return (
        <SettingsModal
            buildNumber={process.env.npm_package_version}
            fingerprint={fingerprint}
            onDownloadLogs={saveLogs}
            session={session}
            user={user}
            socketName={socketName}
            {...props}
        />
    );
});
