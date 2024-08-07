import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import type { IHeaderParams } from '@frontend/ag-grid';
import { Switch } from '@frontend/common/src/components/Switch';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { isNil } from 'lodash-es';
import { memo, useState } from 'react';
import { useEvent } from 'react-use';

import type { TRevisionPropertyRow } from '../defs.ts';
import { cnPropertyHeaderContainer, cnPropertyHeaderName } from './styles.css.ts';

export const PropertyHeader = memo(
    ({
        displayName,
        enableMenu,
        showColumnMenu,
        showOnlyRowsWithDiff,
        toggleShowOnlyRowsWithDiff,
    }: IHeaderParams<TRevisionPropertyRow> & {
        showOnlyRowsWithDiff: boolean;
        toggleShowOnlyRowsWithDiff: VoidFunction;
    }) => {
        const [menuRef, setMenuRef] = useState<HTMLDivElement | null>(null);

        const cbContextMenu = useFunction((e) => {
            if (isNil(menuRef) || !enableMenu || isNil(showColumnMenu)) {
                return;
            }

            e.preventDefault();
            showColumnMenu(menuRef);
        });
        useEvent('contextmenu', cbContextMenu, menuRef);

        return (
            <div className={cnPropertyHeaderContainer} role="presentation" ref={setMenuRef}>
                <span className={cnPropertyHeaderName}>{displayName}</span>
                <Switch
                    size="small"
                    checked={showOnlyRowsWithDiff}
                    onClick={toggleShowOnlyRowsWithDiff}
                    title={
                        showOnlyRowsWithDiff ? 'Display all rows' : 'Display rows with differences'
                    }
                    checkedChildren={<EyeInvisibleOutlined />}
                    unCheckedChildren={<EyeOutlined />}
                />
            </div>
        );
    },
);
