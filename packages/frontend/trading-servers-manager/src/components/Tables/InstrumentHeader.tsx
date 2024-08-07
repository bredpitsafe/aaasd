import { CloseOutlined } from '@ant-design/icons';
import type { IHeaderGroupParams, IHeaderParams } from '@frontend/ag-grid';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { isNil } from 'lodash-es';
import { memo, useState } from 'react';
import { useEvent } from 'react-use';

import type { TPropertyRow } from './defs.ts';
import {
    cnInstrumentHeaderContainer,
    cnInstrumentHeaderIcon,
    cnInstrumentHeaderName,
} from './view.css.ts';

export const InstrumentHeader = memo(
    ({
        displayName,
        removeInstrument,
        ...props
    }: (IHeaderParams<TPropertyRow> | IHeaderGroupParams<TPropertyRow>) & {
        removeInstrument: VoidFunction;
    }) => {
        const [menuRef, setMenuRef] = useState<HTMLDivElement | null>(null);

        const cbContextMenu = useFunction((e) => {
            if (
                isNil(menuRef) ||
                !('enableMenu' in props) ||
                !('showColumnMenu' in props) ||
                !props.enableMenu ||
                isNil(props.showColumnMenu)
            ) {
                return;
            }

            e.preventDefault();
            props.showColumnMenu(menuRef);
        });
        useEvent('contextmenu', cbContextMenu, menuRef);

        return (
            <div className={cnInstrumentHeaderContainer} role="presentation" ref={setMenuRef}>
                <span className={cnInstrumentHeaderName}>{displayName}</span>
                <CloseOutlined className={cnInstrumentHeaderIcon} onClick={removeInstrument} />
            </div>
        );
    },
);
