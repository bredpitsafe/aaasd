import { isNil } from 'lodash-es';
import { memo, useState } from 'react';
import { firstValueFrom } from 'rxjs';

import { createTestProps } from '../../../../e2e';
import { EModalSelectors } from '../../../../e2e/selectors/modal.selectors';
import { getSettingsData } from '../../../actors/Settings/migrateFromIndexDB';
import { useModule } from '../../../di/react';
import { ModuleMessages } from '../../../modules/messages';
import { ENotificationsType } from '../../../modules/notifications/def';
import { ModuleNotifications } from '../../../modules/notifications/module';
import { ModuleSettings } from '../../../modules/settings';
import { useFunction } from '../../../utils/React/useFunction';
import { extractSyncedValueFromValueDescriptor } from '../../../utils/Rx/ValueDescriptor2';
import { WidgetResetAppButton } from '../../../widgets/WidgetResetAppButton';
import { Button } from '../../Button';
import { Col, Row } from '../../Grid';
import { Space } from '../../Space';
import { cnButtonPosition } from './view.css';

export type TDownloadLogsSettingsProps = {
    onDownloadLogs?: VoidFunction;
};

export const DownloadLogsAndResetCache = memo(({ onDownloadLogs }: TDownloadLogsSettingsProps) => {
    const { error } = useModule(ModuleNotifications);
    const { success } = useModule(ModuleMessages);
    const { setAppSettings } = useModule(ModuleSettings);
    const [loading, setLoading] = useState(false);
    const handleMigrateFromIDB = useFunction(async () => {
        try {
            const settingsFromIDB = await getSettingsData();
            setLoading(true);
            const res = await firstValueFrom(
                setAppSettings(settingsFromIDB).pipe(extractSyncedValueFromValueDescriptor()),
            );
            if (!isNil(res.payload.platformTime)) {
                success('Settings successfully migrated to UserSettings service', 2);
            } else {
                throw new Error('Could not transfer settings');
            }
        } catch (e) {
            error({
                type: ENotificationsType.Error,
                message: (e as Error).message ?? 'Could not transfer settings',
            });
        } finally {
            setLoading(false);
        }
    });

    if (isNil(onDownloadLogs)) {
        return null;
    }

    return (
        <Row gutter={[8, 16]}>
            <Col flex="auto" className={cnButtonPosition}>
                <Space>
                    <Button
                        // TODO: temporary disable user settings migration button until service reliability check for 1 month
                        style={{ visibility: 'hidden' }}
                        disabled
                        onClick={handleMigrateFromIDB}
                        type="primary"
                        loading={loading}
                    >
                        Migrate to UserSettings
                    </Button>
                    <Button
                        {...createTestProps(EModalSelectors.DownloadLogsButton)}
                        onClick={onDownloadLogs}
                    >
                        Download logs
                    </Button>
                    <WidgetResetAppButton {...createTestProps(EModalSelectors.RestartAppButton)} />
                </Space>
            </Col>
        </Row>
    );
});
