import type { TraceId } from '@common/utils';
import { useModule } from '@frontend/common/src/di/react';
import type { TBlockchainNetworkId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { memo } from 'react';

import { ModuleSubscribeToConvertRatesOnCurrentStage } from '../../modules/actions/ModuleSubscribeToConvertRatesOnCurrentStage.ts';
import type { TConfirmationTransferAction } from './defs';
import { TransferConfirmationModal } from './view';

export const WidgetTransferConfirmation = memo(
    (
        props: TConfirmationTransferAction & {
            traceId: TraceId;
            onCancel: VoidFunction;
            onConfirm: (network?: TBlockchainNetworkId) => void;
        },
    ) => {
        const { traceId, ...restProps } = props;

        const subscribeToConvertRates = useModule(ModuleSubscribeToConvertRatesOnCurrentStage);
        const convertRates = useNotifiedValueDescriptorObservable(
            subscribeToConvertRates(undefined, { traceId }),
        );

        return <TransferConfirmationModal {...restProps} convertRatesDesc={convertRates} />;
    },
);
