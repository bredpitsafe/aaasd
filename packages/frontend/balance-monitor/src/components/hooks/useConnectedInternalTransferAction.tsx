import type { TraceId } from '@common/utils';
import { Descriptions } from '@frontend/common/src/components/Descriptions';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type {
    TCoinConvertRate,
    TInternalTransferAction,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import {
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { memo } from 'react';

import { ModuleRequestInternalTransferOnCurrentStage } from '../../modules/actions/ModuleRequestInternalTransferOnCurrentStage.ts';
import { ModuleSubscribeToConvertRatesOnCurrentStage } from '../../modules/actions/ModuleSubscribeToConvertRatesOnCurrentStage.ts';
import { AccountWithExchangeIcon } from '../AccountWithExchangeIcon';
import { AmountWithUsdAmount } from '../AmountWithUsdAmount';

export function useConnectedInternalTransferAction(
    traceId: TraceId,
): [(props: TInternalTransferAction) => Promise<boolean>, boolean] {
    const { confirm } = useModule(ModuleModals);

    const subscribeToConvertRates = useModule(ModuleSubscribeToConvertRatesOnCurrentStage);
    const convertRates = useNotifiedValueDescriptorObservable(
        subscribeToConvertRates(undefined, { traceId }),
    );

    const [requestWithNotify, requestProgress] = useNotifiedObservableFunction(
        useModule(ModuleRequestInternalTransferOnCurrentStage),
        {
            mapError: () => ({ message: 'Failed to request internal transfer' }),
            getNotifyTitle: () => ({
                loading: 'Requesting internal transfer',
                success: 'Internal transfer requested successfully',
            }),
        },
    );

    const requestTransferWithConfirmation = useFunction(
        async (props: TInternalTransferAction): Promise<boolean> => {
            const convertRate = isSyncedValueDescriptor(convertRates)
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

            return requestWithNotify(props, { traceId });
        },
    );

    return [requestTransferWithConfirmation, isLoadingValueDescriptor(requestProgress)];
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
