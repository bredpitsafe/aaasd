import { ReactElement, useEffect, useMemo, useState } from 'react';

import {
    EDataSourceStatus,
    EDataSourceType,
    TDataSourceState,
} from '../../modules/dataSourceStatus/defs';
import { getWorstState } from '../../utils/dataSourceStatus';
import { useFunction } from '../../utils/React/useFunction';
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
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [sharedWorkerPopoverOpen, setSharedWorkerPopoverOpen] = useState(false);
    const [socketPopoverOpen, setSocketPopoverOpen] = useState(false);
    const cbOpen = useFunction(() => setDrawerOpen(true));
    const cbCloseDrawer = useFunction(() => (setDrawerOpen(false), onClose?.()));
    const cbClosePopover = useFunction(() => {
        setSharedWorkerPopoverOpen(false);
        setSocketPopoverOpen(false);
    });

    const worstDataSource = useMemo(() => getWorstState(dataSources), [dataSources]);

    const statusMessage = socketStatusToMessage(
        worstDataSource?.status ?? EDataSourceStatus.Unknown,
    );
    const title = `Sockets status: ${worstDataSource?.status ?? EDataSourceStatus.Unknown}`;

    useEffect(() => {
        const workerDataSource = dataSources.find(
            (source) => source.type === EDataSourceType.Worker,
        );
        setSharedWorkerPopoverOpen(workerDataSource?.status === EDataSourceStatus.Disconnected);
    }, [dataSources]);

    useEffect(() => {
        setSocketPopoverOpen(worstDataSource?.status === EDataSourceStatus.Disconnected);
    }, [worstDataSource?.status]);

    return (
        <>
            <Popover
                trigger="click"
                placement="right"
                open={sharedWorkerPopoverOpen || socketPopoverOpen}
                content={
                    <Space direction="vertical">
                        {sharedWorkerPopoverOpen && (
                            <ConnectionAlert
                                showResetCache
                                message="Shared Worker has become unresponsive"
                                description="Data may become stale. It is advised to reload the page"
                                onClose={() => setSharedWorkerPopoverOpen(false)}
                            />
                        )}
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
            >
                {statusMessage && <Alert message={statusMessage} type={worstDataSource?.level} />}
                <div className={cnList}>
                    <DataSourceList networks={dataSources} />
                </div>
            </Drawer>
        </>
    );
}
