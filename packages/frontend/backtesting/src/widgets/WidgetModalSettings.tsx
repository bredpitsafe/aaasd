import { SettingsModal } from '@frontend/common/src/components/Settings/SettingsModal';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleLogger } from '@frontend/common/src/modules/logger';
import { EApplicationName } from '@frontend/common/src/types/app';
import { fingerprintPromise, TFingerprint } from '@frontend/common/src/utils/fingerprint';
import { useSyncPromise } from '@frontend/common/src/utils/React/useSyncPromise';

import { WidgetNotificationPermissions } from './Settings/WidgetNotificationPermissions';

export function WidgetModalSettings(props: { closable?: boolean; onClose?: VoidFunction }) {
    const { saveLogs } = useModule(ModuleLogger);

    const fingerprint = useSyncPromise(fingerprintPromise, '' as TFingerprint);

    return (
        <SettingsModal
            buildNumber={process.env.npm_package_version}
            fingerprint={fingerprint}
            onChangeSocket={props.onClose}
            closable={props.closable ?? true}
            onClose={props.onClose}
            onDownloadLogs={saveLogs}
            settingsStoreName={EApplicationName.BacktestingManager}
        >
            <WidgetNotificationPermissions />
        </SettingsModal>
    );
}
