import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';

import { DistributionCharts } from '../../components/Charts/DistributionCharts/view';
import { EBalanceMonitorLayoutComponents } from '../../layouts/defs';
import { ModuleSubscribeToCoinInfoOnCurrentStage } from '../../modules/actions/ModuleSubscribeToCoinInfoOnCurrentStage.ts';
import { useConnectedActiveCoin } from '../hooks/useConnectedActiveCoin';

export function WidgetDistribution() {
    const traceId = useTraceId();
    const subscribeToCoinInfo = useModule(ModuleSubscribeToCoinInfoOnCurrentStage);
    const coinInfo = useNotifiedValueDescriptorObservable(
        subscribeToCoinInfo(undefined, { traceId }),
    );

    const [coin, setCoin] = useConnectedActiveCoin(EBalanceMonitorLayoutComponents.Distribution);

    return (
        <DistributionCharts coin={coin} coinInfoDescriptor={coinInfo} onSetActiveCoin={setCoin} />
    );
}
