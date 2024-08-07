import { WarningOutlined } from '@ant-design/icons';
import type { IHeaderParams } from '@frontend/ag-grid';
import { Button } from '@frontend/common/src/components/Button.tsx';
import { Tooltip } from '@frontend/common/src/components/Tooltip.tsx';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { isEmpty, isNil } from 'lodash-es';
import { memo, useContext, useState } from 'react';
import { useEvent } from 'react-use';

import type { TProviderPropertyRow } from '../defs.ts';
import { OverrideContext } from './OverrideContext.ts';
import { cnOverrideButtonContainer } from './styles.css.ts';

export const OverrideHeader = memo(
    ({ enableMenu, showColumnMenu }: IHeaderParams<TProviderPropertyRow>) => {
        const overrideContext = useContext(OverrideContext);

        const [menuRef, setMenuRef] = useState<HTMLDivElement | null>(null);

        const cbContextMenu = useFunction((e) => {
            if (!enableMenu || isNil(showColumnMenu) || isNil(menuRef)) {
                return;
            }

            e.preventDefault();
            showColumnMenu(menuRef);
        });
        useEvent('contextmenu', cbContextMenu, menuRef);

        if (isNil(overrideContext) || overrideContext.instruments.length === 0) {
            return <>Override</>;
        }

        const hasMultipleInstruments = overrideContext.instruments.length > 1;

        return (
            <Tooltip
                placement="top"
                title={hasMultipleInstruments ? 'Several instruments selected' : undefined}
                destroyTooltipOnHide
                zIndex={1000}
            >
                <div ref={setMenuRef} className={cnOverrideButtonContainer}>
                    <Button
                        size="small"
                        type="primary"
                        htmlType="submit"
                        disabled={!isEmpty(overrideContext.overrideValidation)}
                        icon={hasMultipleInstruments ? <WarningOutlined /> : undefined}
                        onClick={overrideContext.submitOverrideUpdate}
                    >
                        Update override
                    </Button>
                </div>
            </Tooltip>
        );
    },
);
