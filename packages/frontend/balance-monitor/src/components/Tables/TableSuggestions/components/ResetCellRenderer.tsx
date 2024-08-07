import { RedoOutlined } from '@ant-design/icons';
import type { ICellRendererParams } from '@frontend/ag-grid';
import type { ValueGetterFunc } from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import {
    ESuggestedTransfersTabSelectors,
    SuggestedTransfersTabProps,
} from '@frontend/common/e2e/selectors/balance-monitor/components/suggested-transfers/suggested-transfers.tab.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';
import type { ForwardedRef } from 'react';
import { forwardRef, memo, useContext } from 'react';

import type { TPlainSuggestion } from '../defs';
import { EPlainSuggestionGroup } from '../defs';
import { cnResetButton } from '../view.css';
import { DirtyKeysContext } from './DirtyKeysContext';

export const resetCellValueGetter: ValueGetterFunc<TPlainSuggestion> = ({ data }) => {
    return data && AgValue.create(undefined, data, ['key', 'group']);
};

export const ResetCellRenderer = memo(
    forwardRef(
        (
            { value }: ICellRendererParams<ReturnType<typeof resetCellValueGetter>>,
            ref: ForwardedRef<HTMLElement>,
        ) => {
            const dirtyKeysContext = useContext(DirtyKeysContext);

            const resetCurrentEditing = useFunction(() => {
                if (isNil(dirtyKeysContext) || isNil(value?.data)) {
                    return;
                }

                dirtyKeysContext.resetRowEdited(value?.data.key);
            });

            if (
                isNil(dirtyKeysContext) ||
                isNil(value?.data) ||
                value?.data.group !== EPlainSuggestionGroup.New
            ) {
                return null;
            }

            return (
                <Button
                    {...SuggestedTransfersTabProps[ESuggestedTransfersTabSelectors.ResetButton]}
                    ref={ref}
                    className={cnResetButton}
                    type="text"
                    icon={<RedoOutlined />}
                    disabled={!dirtyKeysContext.dirtyKeysSet.has(value?.data.key)}
                    onClick={resetCurrentEditing}
                />
            );
        },
    ),
);
