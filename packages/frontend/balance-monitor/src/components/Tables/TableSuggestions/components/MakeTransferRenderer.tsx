import type { ICellRendererParams, ValueGetterParams } from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import {
    ESuggestedTransfersTabSelectors,
    SuggestedTransfersTabProps,
} from '@frontend/common/e2e/selectors/balance-monitor/components/suggested-transfers/suggested-transfers.tab.selectors';
import { Button } from '@frontend/common/src/components/Button';
import {
    EInProgressSolutionStatus,
    ETransferKind,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';
import type { ForwardedRef } from 'react';
import { forwardRef, memo, useContext } from 'react';

import { RequestTransferContext } from '../../../RequestTransferContext';
import { getNetworksFromTransfers } from '../../../utils';
import type { TPlainSuggestion } from '../defs';
import { EPlainSuggestionGroup } from '../defs';
import { getSuggestHash, getSuggestKey } from '../utils';
import { cnActionButton } from '../view.css';

export const makeTransferValueGetter = ({ data }: ValueGetterParams<TPlainSuggestion>) => {
    return AgValue.create(undefined, data, [
        'source',
        'possibleTransfers',
        'destination',
        'coin',
        'amount',
        'suggestHash',
        'group',
        'original',
    ]);
};

export const MakeTransferRenderer = memo(
    forwardRef(
        (
            {
                value,
                api,
            }: ICellRendererParams<ReturnType<typeof makeTransferValueGetter>, TPlainSuggestion>,
            ref: ForwardedRef<HTMLElement>,
        ) => {
            const data = value?.data;

            const requestTransfer = useContext(RequestTransferContext);

            const cbRequestTransfer = useFunction(async () => {
                if (isNil(data) || isNil(requestTransfer)) {
                    return;
                }

                const matchTransfers = data.possibleTransfers?.filter(
                    ({ from, to }) =>
                        from.account === data.source && to.account === data.destination,
                );

                const madeTransfer = await requestTransfer({
                    coin: data.coin,
                    from: data.source,
                    fromExchange: matchTransfers?.[0]?.from.exchange,
                    to: data.destination,
                    toExchange: matchTransfers?.[0]?.to.exchange,
                    amount: data.amount,
                    kind:
                        data.suggestHash ===
                        getSuggestHash(data.coin, data.source, data.destination, data.amount)
                            ? ETransferKind.SuggestAccepted
                            : ETransferKind.SuggestEdited,
                    networks: isNil(matchTransfers)
                        ? undefined
                        : getNetworksFromTransfers(matchTransfers),
                });

                if (madeTransfer) {
                    const rowNode = api.getRowNode(
                        getSuggestKey(
                            data.coin,
                            data.original.source,
                            data.original.destination,
                            data.group,
                        ),
                    );

                    if (isNil(rowNode) || isNil(rowNode.data)) {
                        return;
                    }

                    // As discussed in https://krwteam.slack.com/archives/C05D5CCCYEN/p1692265509354789
                    // Move accepted transfer to InProgress
                    api.applyTransaction({
                        update: [
                            {
                                ...rowNode.data,
                                group: EPlainSuggestionGroup.InProgress,
                                status: EInProgressSolutionStatus.Launched,
                            },
                        ],
                    });
                }
            });

            if (isNil(data) || data.group !== EPlainSuggestionGroup.New) {
                return null;
            }

            return (
                <Button
                    {...SuggestedTransfersTabProps[ESuggestedTransfersTabSelectors.SendButton]}
                    ref={ref}
                    className={cnActionButton}
                    type="primary"
                    disabled={isNil(requestTransfer) || data.amount <= 0}
                    onClick={cbRequestTransfer}
                >
                    send
                </Button>
            );
        },
    ),
);
