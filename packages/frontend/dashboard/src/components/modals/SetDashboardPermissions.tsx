import type { TUser } from '@backend/bff/src/modules/authorization/schemas/SubscribeToUserSnapshot.schema.ts';
import type { RowClassParams } from '@frontend/ag-grid';
import {
    DashboardPermissionsModalProps,
    EDashboardPermissionsModal,
} from '@frontend/common/e2e/selectors/dashboard/dashboard.permissions.modal';
import { AgTable } from '@frontend/common/src/components/AgTable/AgTable';
import type { ButtonProps } from '@frontend/common/src/components/Button';
import { Col, Row } from '@frontend/common/src/components/Grid';
import { TooltipParagraph } from '@frontend/common/src/components/Paragraph';
import { Space } from '@frontend/common/src/components/Space';
import { Switch } from '@frontend/common/src/components/Switch';
import type {
    EStorageDashboardSharePermission,
    TStorageDashboardPermission,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useEffect, useMemo, useState } from 'react';

import type { TFullStorageDashboard } from '../../types/fullDashboard';
import { EVERYONE_PERMISSION_KEY } from './hooks/defs';
import { useGetPermissionsContextMenuItems } from './hooks/useGetPermissionsContextMenuItems';
import { usePermissionColumns } from './hooks/usePermissionColumns';
import type { TPermissionItem } from './hooks/usePermissions';
import { usePermissions } from './hooks/usePermissions';
import {
    cnContainer,
    cnDashboardNameHeader,
    cnDashboardNameOverlay,
    cnEveryoneRow,
    cnPermissionsGrid,
    cnPermissionsGridContainer,
} from './style.css';

export function SetDashboardPermissions({
    fullDashboard,
    permissions,
    users,
    onSetSharePermissions,
    onSetPermissionsList,
    onCancel,
    showOnlyActivePermissions,
    setShowOnlyActivePermissions,
    onModalOkButtonPropsChanged,
}: {
    fullDashboard: TFullStorageDashboard;
    permissions: TStorageDashboardPermission[];
    users: TUser[];
    onSetSharePermissions: (sharePermission: EStorageDashboardSharePermission) => Promise<boolean>;
    onSetPermissionsList: (permissions: TStorageDashboardPermission[]) => Promise<boolean>;
    onCancel: () => void;
    showOnlyActivePermissions: boolean;
    setShowOnlyActivePermissions: (value?: boolean) => void;
    onModalOkButtonPropsChanged: (newProps: ButtonProps) => void;
}) {
    const { hasPermissionChanges, list, changePermission, submitAllPermissions } = usePermissions(
        showOnlyActivePermissions,
        fullDashboard.item.sharePermission,
        permissions,
        users,
        onSetSharePermissions,
        onSetPermissionsList,
    );

    const [loading, setLoading] = useState(false);

    const submitPermissions = useFunction(async () => {
        try {
            setLoading(true);

            if (await submitAllPermissions()) {
                onCancel();
            }
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        onModalOkButtonPropsChanged({
            disabled: !hasPermissionChanges || loading,
            loading,
            onClick: submitPermissions,
        });
    }, [hasPermissionChanges, submitPermissions, onModalOkButtonPropsChanged, loading]);

    const columns = usePermissionColumns(changePermission);

    const rowClassRules = useMemo(
        () => ({
            [cnEveryoneRow]: ({ data }: RowClassParams<TPermissionItem>) =>
                data?.key === EVERYONE_PERMISSION_KEY,
        }),
        [],
    );

    const getContextMenuItems = useGetPermissionsContextMenuItems(changePermission);

    const togglePermissions = useFunction(() => setShowOnlyActivePermissions());

    return (
        <Space direction="vertical" className={cnContainer}>
            <Row>
                <Col span={24}>
                    <TooltipParagraph
                        placement="top"
                        className={cnDashboardNameHeader}
                        overlayClassName={cnDashboardNameOverlay}
                    >
                        {fullDashboard.item.name}
                    </TooltipParagraph>
                </Col>
            </Row>
            <Row>
                <Col span={24} className={cnPermissionsGridContainer}>
                    <AgTable
                        className={cnPermissionsGrid}
                        columnDefs={columns}
                        rowKey="key"
                        rowClassRules={rowClassRules}
                        getContextMenuItems={getContextMenuItems}
                        rowData={list}
                        rowSelection="multiple"
                    />
                </Col>
            </Row>
            <Row>
                <Col span={12} />
                <Col span={10}>Show only active permissions</Col>
                <Col span={2} flex="auto">
                    <Switch
                        {...DashboardPermissionsModalProps[
                            EDashboardPermissionsModal.ShowPermissionsSwitch
                        ]}
                        size="small"
                        checked={showOnlyActivePermissions}
                        onClick={togglePermissions}
                    />
                </Col>
            </Row>
        </Space>
    );
}
