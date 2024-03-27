import { DeleteOutlined } from '@ant-design/icons';
import { ICellRendererParams, ValueGetterFunc } from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';
import { ForwardedRef, forwardRef, memo, ReactElement } from 'react';

import type { TPermissionItem } from '../hooks/usePermissions';
import { cnPermissionsContainer } from '../style.css';

export const userWithActionValueGetter: ValueGetterFunc<TPermissionItem> = ({ data }) => {
    return data && AgValue.create(data.user, data, ['key']);
};

export const UserWithAction = memo(
    forwardRef(
        (
            {
                value,
                onDeleteUser,
            }: ICellRendererParams<ReturnType<typeof userWithActionValueGetter>> & {
                onDeleteUser: (key: string) => boolean;
            },
            ref: ForwardedRef<HTMLElement>,
        ): ReactElement => {
            const canDelete = !isNil(value) && value.payload;
            const cbDeleteUser = useFunction(() => {
                if (isNil(value)) {
                    return;
                }

                onDeleteUser(value.data.key);
            });

            return (
                <div ref={ref as ForwardedRef<HTMLDivElement>} className={cnPermissionsContainer}>
                    {canDelete && <DeleteOutlined onClick={cbDeleteUser} />} {value?.payload}
                </div>
            );
        },
    ),
);
