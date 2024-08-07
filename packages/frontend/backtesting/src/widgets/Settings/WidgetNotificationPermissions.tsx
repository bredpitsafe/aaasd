import { Col, Row } from '@frontend/common/src/components/Grid';
import { cnButtonPosition } from '@frontend/common/src/components/Settings/components/view.css';
import { Switch } from '@frontend/common/src/components/Switch';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleSystemNotifications } from '@frontend/common/src/modules/systemNotifications/module';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import { useShowRunStatusNotifications } from './useShowRunStatusNotifications';

export const WidgetNotificationPermissions = memo(() => {
    const { permission$, requestPermission } = useModule(ModuleSystemNotifications);

    const permission = useSyncObservable(permission$);

    const [showNotifications, setShowNotifications, , loading] = useShowRunStatusNotifications();

    const handleEnableNotifications = useFunction(async (showNotifications: boolean) =>
        setShowNotifications(
            showNotifications &&
                permission !== 'denied' &&
                (permission !== 'default' || (await requestPermission()) === 'granted'),
        ),
    );

    if (isNil(permission)) {
        return null;
    }

    return (
        <Row gutter={[8, 16]}>
            <Col span={20}>Notify when Backtesting Run completes or fails</Col>
            <Col flex="auto" className={cnButtonPosition}>
                <Switch
                    size="small"
                    disabled={permission === 'denied'}
                    checked={permission === 'granted' && showNotifications}
                    loading={loading}
                    onChange={handleEnableNotifications}
                    title={
                        permission === 'denied'
                            ? 'Unblock notifications in browser settings for this site'
                            : undefined
                    }
                />
            </Col>
        </Row>
    );
});
