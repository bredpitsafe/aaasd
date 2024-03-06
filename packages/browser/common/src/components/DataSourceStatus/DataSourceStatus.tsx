import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';

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
import { DataSourceBadge } from './DataSourceBadge';
import { DataSourceList } from './DataSourceList';
import { cnList } from './DataSourceStatus.css';
import { SharedWorkerNotResponsiveAlert } from './SharedWorkerNotResponsiveAlert';
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
    const [popoverOpen, setPopoverOpen] = useState(false);
    const cbOpen = useCallback(() => setDrawerOpen(true), []);
    const cbCloseDrawer = useFunction(() => (setDrawerOpen(false), onClose?.()));
    const cbClosePopover = useFunction(() => setPopoverOpen(false));

    const worstDataSource = useMemo(() => getWorstState(dataSources), [dataSources]);

    const statusMessage = socketStatusToMessage(
        worstDataSource?.status ?? EDataSourceStatus.Unknown,
    );
    const badAlert = statusMessage && (
        <Alert message={statusMessage} type={worstDataSource?.level} />
    );

    const title = `Sockets status: ${worstDataSource?.status ?? EDataSourceStatus.Unknown}`;

    useEffect(() => {
        const workerDataSource = dataSources.find(
            (source) => source.type === EDataSourceType.Worker,
        );
        if (workerDataSource?.status === EDataSourceStatus.Disconnected) {
            setPopoverOpen(true);
        }
    }, [dataSources]);

    return (
        <>
            <Popover
                placement="right"
                open={popoverOpen}
                content={<SharedWorkerNotResponsiveAlert onClose={cbClosePopover} />}
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
                {badAlert}
                <div className={cnList}>
                    <DataSourceList networks={dataSources} />
                </div>
            </Drawer>
        </>
    );
}
