import { Error } from '@frontend/common/src/components/Error/view';
import { TableDashboards } from '@frontend/common/src/components/Tables/TableDashboards/view';
import type { TRobotDashboard } from '@frontend/common/src/handlers/def';
import { Nil } from '@frontend/common/src/types';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import type { TimeZone } from '@frontend/common/src/types/time';
import { isArray, isEmpty, isNil } from 'lodash-es';

import { cnRoot, cnTable } from './view.css';

type TBacktestingTableDashboardsProps = TWithClassname & {
    socketName: Nil | TSocketName;
    dashboards: Nil | TRobotDashboard[];
    onDashboardLinkClick?: (url: string, name: string) => void;
    timeZone: TimeZone;
};

export function BacktestingTableDashboards(props: TBacktestingTableDashboardsProps) {
    return (
        <div className={cnRoot}>
            <div className={cnTable}>
                {isEmpty(props.dashboards) ? (
                    <Error status="info" title="Dashboards not found" />
                ) : null}
                {!isNil(props.socketName) &&
                isArray(props.dashboards) &&
                props.dashboards.length > 0 ? (
                    <TableDashboards
                        timeZone={props.timeZone}
                        socketName={props.socketName}
                        dashboards={props.dashboards}
                        onDashboardLinkClick={props.onDashboardLinkClick}
                    />
                ) : null}
            </div>
        </div>
    );
}
