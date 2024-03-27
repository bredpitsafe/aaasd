import { useModule } from '@frontend/common/src/di/react';
import type { TBlockchainNetworkId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useValueDescriptorObservableDeprecated } from '@frontend/common/src/utils/React/useValueDescriptorObservableDeprecated';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { memo } from 'react';

import { ModuleConvertRates } from '../../modules/observables/ModuleConvertRates';
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
        const { getConvertRates$ } = useModule(ModuleConvertRates);

        const { traceId, ...restProps } = props;

        const convertRates = useValueDescriptorObservableDeprecated(getConvertRates$(traceId));

        return <TransferConfirmationModal {...restProps} convertRatesDesc={convertRates} />;
    },
);
