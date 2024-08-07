import type { ICellRendererParams } from '@frontend/ag-grid';
import type { ValueGetterParams } from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import { EStorageDashboardPermission } from '@frontend/common/src/types/domain/dashboardsStorage';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { ForwardedRef, ReactElement } from 'react';
import { forwardRef, memo, useMemo } from 'react';

import type { TPermissionKey } from '../hooks/defs';
import {
    cnPermissionIcon,
    cnPermissionIconDisabled,
    cnPermissionIconSelected,
    cnPermissionsContainer,
} from '../style.css';

export const permissionsIconValueGetter = ({ data }: ValueGetterParams) => {
    return data && AgValue.create(data.permission, data, ['possiblePermissions', 'key']);
};

export const PermissionsIcon = memo(
    forwardRef(
        (
            {
                value,
                onChangePermission,
            }: ICellRendererParams<ReturnType<typeof permissionsIconValueGetter>> & {
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
                    {!isNil(value) && (
                        <>
                            <PermissionIcon
                                value={value}
                                permission={EStorageDashboardPermission.Owner}
                                onChangePermission={changePermission}
                            />
                            <PermissionIcon
                                value={value}
                                permission={EStorageDashboardPermission.Editor}
                                onChangePermission={changePermission}
                            />
                            <PermissionIcon
                                value={value}
                                permission={EStorageDashboardPermission.Viewer}
                                onChangePermission={changePermission}
                            />
                            <PermissionIcon
                                value={value}
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
        permission,
        onChangePermission,
    }: {
        value: ReturnType<typeof permissionsIconValueGetter>;
        permission: EStorageDashboardPermission;
        onChangePermission: (key: TPermissionKey, permission: EStorageDashboardPermission) => void;
    }) => {
        const disabled = useMemo(
            () => !value.data.possiblePermissions.includes(permission),
            [value.data.possiblePermissions, permission],
        );

        const cbChangePermission = useFunction(() => {
            if (isNil(value.data) || disabled) {
                return;
            }

            onChangePermission(value.data.key, permission);
        });

        return (
            <span
                className={cn(cnPermissionIcon, {
                    [cnPermissionIconDisabled]: disabled,
                    [cnPermissionIconSelected[permission]]: value.payload === permission,
                })}
                title={permission}
                onClick={cbChangePermission}
            >
                {permission.toUpperCase().substring(0, 1)}
            </span>
        );
    },
);
