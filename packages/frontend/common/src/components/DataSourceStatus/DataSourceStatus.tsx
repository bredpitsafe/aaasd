import { EApplicationName } from '@common/types';
import type { ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { useAppName } from '../../hooks/useAppName.ts';
import type { TDataSourceState } from '../../modules/dataSourceStatus/defs';
import { EDataSourceStatus } from '../../modules/dataSourceStatus/defs';
import { getWorstState } from '../../utils/dataSourceStatus';
import { useFunction } from '../../utils/React/useFunction';
import { WidgetButtonSubscriptionsModal } from '../../widgets/ButtonSubscriptionsModal/WidgetButtonSubscriptionsModal.tsx';
import { Alert } from '../Alert';
import { Drawer } from '../Drawer';
import { Popover } from '../Popover';
import { Space } from '../Space.ts';
import { ConnectionAlert } from './ConnectionAlert.tsx';
import { DataSourceBadge } from './DataSourceBadge';
import { DataSourceList } from './DataSourceList';
import { cnList } from './DataSourceStatus.css';
import { socketStatusToMessage } from './utils';

export type TNetworkStatusProps = {
    dataSources: TDataSourceState[];
    onClose?: VoidFunction;
    badgeClassName?: string;
};

const drawerBodyStyle = { padding: 0 };

export function DataSourceStatus({
    dataSources,
    onClose,
    badgeClassName,
}: TNetworkStatusProps): ReactElement {
    const appName = useAppName();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [socketPopoverOpen, setSocketPopoverOpen] = useState(false);
    const cbOpen = useFunction(() => setDrawerOpen(true));
    const cbCloseDrawer = useFunction(() => (setDrawerOpen(false), onClose?.()));
    const cbClosePopover = useFunction(() => {
        setSocketPopoverOpen(false);
    });

    const worstDataSource = useMemo(() => getWorstState(dataSources), [dataSources]);

    const statusMessage = socketStatusToMessage(
        worstDataSource?.status ?? EDataSourceStatus.Unknown,
    );
    const title = `Sockets status: ${worstDataSource?.status ?? EDataSourceStatus.Unknown}`;

    useEffect(() => {
        setSocketPopoverOpen(worstDataSource?.status === EDataSourceStatus.Disconnected);
    }, [worstDataSource?.status]);

    return (
        <>
            <Popover
                trigger="click"
                placement="right"
                open={socketPopoverOpen}
                content={
                    <Space direction="vertical">
                        {socketPopoverOpen && (
                            <ConnectionAlert
                                type="error"
                                message="Connection to host domain has been lost"
                                description="Some data sources are disconnected. Check your Internet and VPN connection."
                                onClose={() => setSocketPopoverOpen(false)}
                            />
                        )}
                    </Space>
                }
                onOpenChange={cbClosePopover}
            >
                <DataSourceBadge
                    className={badgeClassName}
                    level={worstDataSource?.level}
                    title={title}
                    onClick={cbOpen}
                />
            </Popover>
            <Drawer
                title="Sockets"
                placement="right"
                open={drawerOpen}
                onClose={cbCloseDrawer}
                bodyStyle={drawerBodyStyle}
                extra={
                    <WidgetButtonSubscriptionsModal
                        tableWithRouterSync={appName !== EApplicationName.Dashboard}
                    />
                }
            >
                {statusMessage && <Alert message={statusMessage} type={worstDataSource?.level} />}
                <div className={cnList}>
                    <DataSourceList networks={dataSources} />
                </div>
            </Drawer>
        </>
    );
}
