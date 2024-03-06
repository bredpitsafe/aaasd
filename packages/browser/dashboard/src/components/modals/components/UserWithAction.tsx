import { DeleteOutlined } from '@ant-design/icons';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { ICellRendererParams } from 'ag-grid-community';
import { isNil } from 'lodash-es';
import { ForwardedRef, forwardRef, memo, ReactElement } from 'react';

import type { TPermissionItem } from '../hooks/usePermissions';
import { cnPermissionsContainer } from '../style.css';

export const UserWithAction = memo(
    forwardRef(
        (
            {
                value,
                data,
                onDeleteUser,
            }: ICellRendererParams<TPermissionItem, string> & {
                onDeleteUser: (key: string) => boolean;
            },
            ref: ForwardedRef<HTMLElement>,
        ): ReactElement => {
            const canDelete = !isNil(data) && data.canDelete;

            const cbDeleteUser = useFunction(() => {
                if (isNil(data)) {
                    return;
                }

                onDeleteUser(data.key);
            });

            return (
                <div ref={ref as ForwardedRef<HTMLDivElement>} className={cnPermissionsContainer}>
                    {canDelete && <DeleteOutlined onClick={cbDeleteUser} />} {value}
                </div>
            );
        },
    ),
);
