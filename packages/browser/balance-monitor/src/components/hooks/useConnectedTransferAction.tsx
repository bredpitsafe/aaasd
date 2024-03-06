import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { TBlockchainNetworkId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { isFailDesc, isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { useState } from 'react';
import { useMountedState } from 'react-use';
import { firstValueFrom } from 'rxjs';
import { first } from 'rxjs/operators';

import { ModuleRequestTransferAction } from '../../modules/actions/ModuleRequestTransferAction';
import { WidgetTransferConfirmation } from '../../widgets/WidgetTransferConfirmation';
import type { TConfirmationTransferAction } from '../../widgets/WidgetTransferConfirmation/defs';

export function useConnectedTransferAction(
    traceId: TraceId,
): [(props: TConfirmationTransferAction) => Promise<boolean>, boolean] {
    const { requestTransfer } = useModule(ModuleRequestTransferAction);
    const { show } = useModule(ModuleModals);

    const isMounted = useMountedState();
    const [requestTransferInProgress, setRequestTransferInProgress] = useState(false);

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

            setRequestTransferInProgress(true);

            const result = await firstValueFrom(
                requestTransfer(
                    {
                        coin: props.coin,
                        from: props.from,
                        to: props.to,
                        amount: props.amount,
                        kind: props.kind,
                        network: confirmation.network,
                    },
                    traceId,
                ).pipe(
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
