import { AreaChartOutlined, LineChartOutlined } from '@ant-design/icons';
import type { Nanoseconds } from '@common/types';
import { iso2nanoseconds, nanoseconds2iso } from '@common/utils';
import pluralize from 'pluralize';
import type { MouseEventHandler } from 'react';
import { useMemo } from 'react';

import {
    ETableTabFilterProps,
    ETableTabFilterSelectors,
} from '../../../e2e/selectors/table-tab.filter.selectors';
import {
    EDashboardsTabProps,
    EDashboardsTabSelectors,
} from '../../../e2e/selectors/trading-servers-manager/components/dashboards-tab/dashboards.tab.selectors';
import type { TIndicator } from '../../modules/actions/indicators/defs';
import type { TSocketName } from '../../types/domain/sockets';
import { useFunction } from '../../utils/React/useFunction';
import { getIndicatorsDashboardURL } from '../../utils/urlBuilders';
import { TableLabelButton } from './Button';

type TTableLabelIndicatorsDashboardProps = {
    socketName?: TSocketName;
    selectedRows?: TIndicator[];
    backtestingRunId?: number;
    onClick?: (url: string, name: string) => void;
};

const MAX_INDICATORS = 100;

export function TableLabelIndicatorsDashboard(props: TTableLabelIndicatorsDashboardProps) {
    const { socketName, selectedRows: rows, backtestingRunId, onClick } = props;
    const selectedRows = rows?.slice(0, MAX_INDICATORS);
    const selected = selectedRows?.length;

    const url = useMemo(() => {
        const list = selectedRows?.map((indicator) => indicator.name);
        const focusTo = selectedRows?.reduce((max: Nanoseconds | undefined, item) => {
            const platformTimeNS =
                item.platformTime === null ? null : iso2nanoseconds(item.platformTime);

            return platformTimeNS !== null && (max === undefined || platformTimeNS > max)
                ? platformTimeNS
                : max;
        }, undefined);

        return list?.length
            ? getIndicatorsDashboardURL(
                  list,
                  socketName,
                  focusTo === undefined ? undefined : nanoseconds2iso(focusTo),
                  backtestingRunId,
              )
            : undefined;
    }, [selectedRows, socketName, backtestingRunId]);

    const cbClick: MouseEventHandler<HTMLAnchorElement> = useFunction((event) => {
        // If Ctrl or Meta keys are pressed, use link as usual.
        // If clicked without modifiers, use the listener to perform alt action.
        if (url && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            onClick?.(url, pluralize('indicator', selected, true));
        }
    });

    const hasActiveSelection = selected !== undefined && selected > 0;
    const icon = hasActiveSelection ? <AreaChartOutlined /> : <LineChartOutlined />;

    return (
        <>
            <a
                {...EDashboardsTabProps[EDashboardsTabSelectors.DashboardLinkButton]}
                href={url}
                target="_blank"
                rel="noreferrer"
                onClick={cbClick}
            >
                <TableLabelButton
                    {...ETableTabFilterProps[ETableTabFilterSelectors.DashboardButton]}
                    icon={icon}
                    title={
                        selected
                            ? `Open dashboard with ${selected} indicators`
                            : `Select some indicators to open them as dashboard`
                    }
                    disabled={!hasActiveSelection}
                >
                    Dashboard {selected ? `(${selected})` : null}
                </TableLabelButton>
            </a>
        </>
    );
}
