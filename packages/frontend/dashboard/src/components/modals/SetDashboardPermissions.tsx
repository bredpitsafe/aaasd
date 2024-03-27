import type { RowClassParams } from '@frontend/ag-grid';
import { AgTable } from '@frontend/common/src/components/AgTable/AgTable';
import { Col, Row } from '@frontend/common/src/components/Grid';
import { Modal } from '@frontend/common/src/components/Modals';
import { TooltipParagraph } from '@frontend/common/src/components/Paragraph';
import { Space } from '@frontend/common/src/components/Space';
import { Switch } from '@frontend/common/src/components/Switch';
import type { TUserName } from '@frontend/common/src/modules/user';
import type {
    EStorageDashboardSharePermission,
    TStorageDashboardPermission,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { uniq } from 'lodash-es';
import { useMemo } from 'react';

import type { TFullStorageDashboard } from '../../types/fullDashboard';
import { AddUserForm } from './components/AddUserForm';
import { EVERYONE_PERMISSION_KEY } from './hooks/defs';
import { useGetPermissionsContextMenuItems } from './hooks/useGetPermissionsContextMenuItems';
import { usePermissionColumns } from './hooks/usePermissionColumns';
import { TPermissionItem, usePermissions } from './hooks/usePermissions';
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
}: {
    fullDashboard: TFullStorageDashboard;
    permissions: TStorageDashboardPermission[];
    users: TUserName[];
    onSetSharePermissions: (sharePermission: EStorageDashboardSharePermission) => Promise<boolean>;
    onSetPermissionsList: (permissions: TStorageDashboardPermission[]) => Promise<boolean>;
    onCancel: () => void;
    showOnlyActivePermissions: boolean;
    setShowOnlyActivePermissions: (value?: boolean) => void;
}) {
    const {
        hasPermissionChanges,
        list,
        newUsers,
        changePermission,
        addUser,
        deleteUser,
        submitAllPermissions,
    } = usePermissions(
        showOnlyActivePermissions,
        fullDashboard.item.sharePermission,
        permissions,
        users,
        onSetSharePermissions,
        onSetPermissionsList,
    );

    const columns = usePermissionColumns(changePermission, deleteUser);

    const rowClassRules = useMemo(
        () => ({
            [cnEveryoneRow]: ({ data }: RowClassParams<TPermissionItem>) =>
                data?.key === EVERYONE_PERMISSION_KEY,
        }),
        [],
    );

    const submitPermissions = useFunction(async () => {
        if (await submitAllPermissions()) {
            onCancel();
        }
    });

    const getContextMenuItems = useGetPermissionsContextMenuItems(changePermission);

    const togglePermissions = useFunction(() => setShowOnlyActivePermissions());

    const allUsers = useMemo(() => uniq([...users, ...newUsers]), [users, newUsers]);

    return (
        <Modal
            title="Change dashboard permissions"
            open={true}
            okButtonProps={{ disabled: !hasPermissionChanges }}
            onCancel={onCancel}
            onOk={submitPermissions}
        >
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
                            headerHeight={0}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col span={12} />
                    <Col span={10}>Show only active permissions</Col>
                    <Col span={2} flex="auto">
                        <Switch
                            size="small"
                            checked={showOnlyActivePermissions}
                            onClick={togglePermissions}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <AddUserForm users={allUsers} onAddUser={addUser} />
                    </Col>
                </Row>
            </Space>
        </Modal>
    );
}
