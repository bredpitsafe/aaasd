import type { TraceId } from '@common/utils';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { TBlockchainNetworkId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { isLoadingValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';

import { ModuleRequestTransferOnCurrentStage } from '../../modules/actions/ModuleRequestTransferOnCurrentStage.ts';
import { WidgetTransferConfirmation } from '../../widgets/WidgetTransferConfirmation';
import type { TConfirmationTransferAction } from '../../widgets/WidgetTransferConfirmation/defs';

export function useConnectedTransferAction(
    traceId: TraceId,
): [(props: TConfirmationTransferAction) => Promise<boolean>, boolean] {
    const { show } = useModule(ModuleModals);

    const [requestTransfer, requestProgress] = useNotifiedObservableFunction(
        useModule(ModuleRequestTransferOnCurrentStage),
        {
            mapError: () => ({ message: 'Failed to request transfer' }),
            getNotifyTitle: () => ({
                loading: 'Requesting transfer',
                success: 'Transfer requested successfully',
            }),
        },
    );

    const requestTransferWithConfirmation = useFunction(
        async (props: TConfirmationTransferAction): Promise<boolean> => {
            const confirmation = await new Promise<
                { confirmed: false } | { confirmed: true; network?: TBlockchainNetworkId }
            >((resolve) => {
                const modal = show(
                    <WidgetTransferConfirmation
                        {...props}
                        traceId={traceId}
                        onCancel={cancelTransfer}
                        onConfirm={confirmTransfer}
                    />,
                );

                function cancelTransfer() {
                    modal.destroy();
                    resolve({ confirmed: false });
                }

                function confirmTransfer(network: undefined | TBlockchainNetworkId) {
                    modal.destroy();
                    resolve({ confirmed: true, network });
                }
            });

            if (!confirmation.confirmed) {
                return false;
            }

            return requestTransfer(
                {
                    coin: props.coin,
                    from: props.from,
                    to: props.to,
                    amount: props.amount,
                    kind: props.kind,
                    network: confirmation.network,
                },
                { traceId },
            );
        },
    );

    return [requestTransferWithConfirmation, isLoadingValueDescriptor(requestProgress)];
}
