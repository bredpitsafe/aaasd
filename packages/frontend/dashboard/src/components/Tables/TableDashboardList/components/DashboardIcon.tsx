import {
    ForkOutlined,
    LineChartOutlined,
    PullRequestOutlined,
    RobotOutlined,
    ShareAltOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { assertNever } from '@common/utils/src/assert.ts';
import type { ICellRendererParams } from '@frontend/ag-grid';
import { EStorageDashboardPermission } from '@frontend/common/src/types/domain/dashboardsStorage';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import type { TDashboardItem, TStorageDashboardItem } from '../../../../types/fullDashboard';
import {
    isIndicatorsDashboardItem,
    isRobotDashboardItem,
    isStorageDashboardItem,
} from '../../../../types/fullDashboard/guards';
import {
    hasDashboardOwnership,
    isReadonlyDashboardsStorageItem,
} from '../../../../utils/dashboards';
import { cnIcon } from '../styles.css';

export const DashboardIcon = memo((params: ICellRendererParams<unknown, TDashboardItem>) => {
    const dashboardItem = params.data;

    if (isNil(dashboardItem)) {
        return null;
    }

    if (isRobotDashboardItem(dashboardItem)) {
        return (
            <RobotOutlined
                className={cnIcon}
                title={getIconTitle('Robot dashboard', dashboardItem.item.hasDraft)}
            />
        );
    }

    if (isIndicatorsDashboardItem(dashboardItem)) {
        return (
            <LineChartOutlined
                className={cnIcon}
                title={getIconTitle('TSM indicators dashboard', dashboardItem.item.hasDraft)}
            />
        );
    }

    if (isStorageDashboardItem(dashboardItem)) {
        if (hasDashboardOwnership(dashboardItem.item)) {
            return (
                <UserOutlined
                    className={cnIcon}
                    title={getStorageDashboardIconTitle(dashboardItem)}
                />
            );
        }

        if (!dashboardItem.item.hasDraft) {
            return (
                <ShareAltOutlined
                    className={cnIcon}
                    title={getStorageDashboardIconTitle(dashboardItem)}
                />
            );
        }

        return isReadonlyDashboardsStorageItem(dashboardItem.item) ? (
            <ForkOutlined className={cnIcon} title={getStorageDashboardIconTitle(dashboardItem)} />
        ) : (
            <PullRequestOutlined
                className={cnIcon}
                title={getStorageDashboardIconTitle(dashboardItem)}
            />
        );
    }

    assertNever(dashboardItem);
});

function getIconTitle(text: string, isDirty: boolean): string {
    return isDirty ? `${text} with changes` : text;
}

function getStorageDashboardIconTitle(
    dashboardItem: Pick<TStorageDashboardItem, 'item'>,
): string | undefined {
    const permission = dashboardItem.item.permission;

    switch (permission) {
        case EStorageDashboardPermission.Owner:
            return getIconTitle('Own dashboard', dashboardItem.item.hasDraft);
        case EStorageDashboardPermission.Editor:
            return getIconTitle('Shared editable dashboard', dashboardItem.item.hasDraft);
        case EStorageDashboardPermission.Viewer:
            return getIconTitle('Shared readonly dashboard', dashboardItem.item.hasDraft);
        case EStorageDashboardPermission.None:
            return undefined;
        default:
            assertNever(permission);
    }
}
