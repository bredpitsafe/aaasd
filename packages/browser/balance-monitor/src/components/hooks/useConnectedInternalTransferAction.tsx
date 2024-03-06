import { Descriptions } from '@frontend/common/src/components/Descriptions';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type {
    TCoinConvertRate,
    TInternalTransferAction,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { IdleDesc, isFailDesc, isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { memo, useMemo, useState } from 'react';
import { useMountedState } from 'react-use';
import { firstValueFrom } from 'rxjs';
import { first } from 'rxjs/operators';

import { ModuleRequestInternalTransferAction } from '../../modules/actions/ModuleRequestInternalTransferAction';
import { ModuleConvertRates } from '../../modules/observables/ModuleConvertRates';
import { AccountWithExchangeIcon } from '../AccountWithExchangeIcon';
import { AmountWithUsdAmount } from '../AmountWithUsdAmount';

export function useConnectedInternalTransferAction(
    traceId: TraceId,
): [(props: TInternalTransferAction) => Promise<boolean>, boolean] {
    const { getConvertRates$ } = useModule(ModuleConvertRates);
    const { requestInternalTransfer } = useModule(ModuleRequestInternalTransferAction);
    const { confirm } = useModule(ModuleModals);

    const convertRates = useSyncObservable(
        getConvertRates$(traceId),
        useMemo(() => IdleDesc(), []),
    );

    const isMounted = useMountedState();
    const [requestTransferInProgress, setRequestTransferInProgress] = useState(false);

    const requestTransferWithConfirmation = useFunction(
        async (props: TInternalTransferAction): Promise<boolean> => {
            const convertRate = isSyncDesc(convertRates)
                ? convertRates.value.get(props.coin)
                : undefined;

            const approvedTransfer = await confirm('', {
                title: 'Internal transfer confirmation',
                width: '650px',
                content: <InternalTransferConfirmation {...props} convertRate={convertRate} />,
            });

            if (!approvedTransfer) {
                return false;
            }

            setRequestTransferInProgress(true);

            const result = await firstValueFrom(
                requestInternalTransfer(props, traceId).pipe(
                    first(
                        (valueDescriptor) =>
                            isSyncDesc(valueDescriptor) || isFailDesc(valueDescriptor),
                    ),
                ),
            );

            if (isMounted()) {
                setRequestTransferInProgress(false);
            }

            return isSyncDesc(result);
        },
    );

    return [requestTransferWithConfirmation, requestTransferInProgress];
}

const InternalTransferConfirmation = memo(
    (props: TInternalTransferAction & { convertRate: TCoinConvertRate | undefined }) => {
        return (
            <Descriptions bordered layout="horizontal" column={1} size="small">
                <Descriptions.Item label="Main Account">
                    <AccountWithExchangeIcon account={props.mainAccount} />
                </Descriptions.Item>
                <Descriptions.Item label="From">
                    <strong>{props.from.name}</strong> / {props.from.section}
                </Descriptions.Item>
                <Descriptions.Item label="To">
                    <strong>{props.to.name}</strong> / {props.to.section}
                </Descriptions.Item>
                <Descriptions.Item label="Amount">
                    <AmountWithUsdAmount
                        amount={props.amount}
                        coin={props.coin}
                        convertRate={props.convertRate}
                    />
                </Descriptions.Item>
            </Descriptions>
        );
    },
);
