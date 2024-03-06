import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { UnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { useMemo } from 'react';

import { DistributionCharts } from '../../components/Charts/DistributionCharts/view';
import { EBalanceMonitorLayoutComponents } from '../../layouts/defs';
import { ModuleCoinInfo } from '../../modules/observables/ModuleCoinInfo';
import { useConnectedActiveCoin } from '../hooks/useConnectedActiveCoin';

export function WidgetDistribution() {
    const { getCoinInfo$ } = useModule(ModuleCoinInfo);

    const traceId = useTraceId();

    const coinInfo = useSyncObservable(
        getCoinInfo$(traceId),
        useMemo(() => UnscDesc(null), []),
    );
    const [coin, setCoin] = useConnectedActiveCoin(EBalanceMonitorLayoutComponents.Distribution);

    return (
        <DistributionCharts coin={coin} coinInfoDescriptor={coinInfo} onSetActiveCoin={setCoin} />
    );
}
