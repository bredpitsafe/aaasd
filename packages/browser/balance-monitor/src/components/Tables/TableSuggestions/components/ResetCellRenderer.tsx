import { RedoOutlined } from '@ant-design/icons';
import {
    ESuggestedTransfersTabSelectors,
    SuggestedTransfersTabProps,
} from '@frontend/common/e2e/selectors/balance-monitor/components/suggested-transfers/suggested-transfers.tab.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { ICellRendererParams } from 'ag-grid-community';
import { isNil } from 'lodash-es';
import { ForwardedRef, forwardRef, memo, useContext } from 'react';

import type { TPlainSuggestion } from '../defs';
import { EPlainSuggestionGroup } from '../defs';
import { cnResetButton } from '../view.css';
import { DirtyKeysContext } from './DirtyKeysContext';

export const ResetCellRenderer = memo(
    forwardRef(
        ({ data }: ICellRendererParams<TPlainSuggestion>, ref: ForwardedRef<HTMLElement>) => {
            const dirtyKeysContext = useContext(DirtyKeysContext);

            const resetCurrentEditing = useFunction(() => {
                if (isNil(dirtyKeysContext) || isNil(data)) {
                    return;
                }

                dirtyKeysContext.resetRowEdited(data.key);
            });

            if (
                isNil(dirtyKeysContext) ||
                isNil(data) ||
                data.group !== EPlainSuggestionGroup.New
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
                    disabled={!dirtyKeysContext.dirtyKeysSet.has(data.key)}
                    onClick={resetCurrentEditing}
                />
            );
        },
    ),
);
