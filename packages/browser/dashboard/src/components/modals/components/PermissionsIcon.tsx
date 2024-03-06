import { EStorageDashboardPermission } from '@frontend/common/src/types/domain/dashboardsStorage';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { ICellRendererParams } from 'ag-grid-community';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import { ForwardedRef, forwardRef, memo, ReactElement, useMemo } from 'react';

import type { TDashboardPermission, TPermissionKey } from '../hooks/defs';
import type { TPermissionItem } from '../hooks/usePermissions';
import {
    cnPermissionIcon,
    cnPermissionIconDisabled,
    cnPermissionIconSelected,
    cnPermissionsContainer,
} from '../style.css';

export const PermissionsIcon = memo(
    forwardRef(
        (
            {
                value,
                data,
                onChangePermission,
            }: ICellRendererParams<TPermissionItem, TDashboardPermission> & {
                onChangePermission: (
                    keys: TPermissionKey[],
                    permission: EStorageDashboardPermission,
                ) => void;
            },
            ref: ForwardedRef<HTMLElement>,
        ): ReactElement => {
            const changePermission = useFunction(
                (key: TPermissionKey, permission: EStorageDashboardPermission) =>
                    onChangePermission([key], permission),
            );

            return (
                <div ref={ref as ForwardedRef<HTMLDivElement>} className={cnPermissionsContainer}>
                    {!isNil(data) && !isNil(value) && (
                        <>
                            <PermissionIcon
                                value={value}
                                data={data}
                                permission={EStorageDashboardPermission.Owner}
                                onChangePermission={changePermission}
                            />
                            <PermissionIcon
                                value={value}
                                data={data}
                                permission={EStorageDashboardPermission.Editor}
                                onChangePermission={changePermission}
                            />
                            <PermissionIcon
                                value={value}
                                data={data}
                                permission={EStorageDashboardPermission.Viewer}
                                onChangePermission={changePermission}
                            />
                            <PermissionIcon
                                value={value}
                                data={data}
                                permission={EStorageDashboardPermission.None}
                                onChangePermission={changePermission}
                            />
                        </>
                    )}
                </div>
            );
        },
    ),
);

const PermissionIcon = memo(
    ({
        value,
        data,
        permission,
        onChangePermission,
    }: {
        value: TDashboardPermission;
        data: TPermissionItem;
        permission: EStorageDashboardPermission;
        onChangePermission: (key: TPermissionKey, permission: EStorageDashboardPermission) => void;
    }) => {
        const disabled = useMemo(
            () => !data.possiblePermissions.includes(permission),
            [data.possiblePermissions, permission],
        );

        const cbChangePermission = useFunction(() => {
            if (isNil(data) || disabled) {
                return;
            }

            onChangePermission(data.key, permission);
        });

        return (
            <span
                className={cn(cnPermissionIcon, {
                    [cnPermissionIconDisabled]: disabled,
                    [cnPermissionIconSelected[permission]]: value === permission,
                })}
                title={permission}
                onClick={cbChangePermission}
            >
                {permission.toUpperCase().substring(0, 1)}
            </span>
        );
    },
);
