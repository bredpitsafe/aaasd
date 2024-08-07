import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { ComponentProps, ReactElement } from 'react';

import { CoinSelector } from '../../components/Settings/components/StageSelect/CoinSelector';
import { useCoinSelectionTabs } from '../../components/Settings/hooks/useCoinSelectionTabs';
import { ModuleSubscribeToCoinInfoOnCurrentStage } from '../../modules/actions/ModuleSubscribeToCoinInfoOnCurrentStage.ts';
import { ModuleActiveCoin } from '../../modules/ModuleActiveCoin';

type TCoinSelectorProps = ComponentProps<typeof CoinSelector>;
type TProps = TWithClassname & {
    size: TCoinSelectorProps['size'];
    type: TCoinSelectorProps['type'];
    bordered?: TCoinSelectorProps['bordered'];
};

export function WidgetCoinSelector({
    size,
    type,
    bordered,
    className,
}: TProps): ReactElement | null {
    const { activeCoin$, setActiveCoin } = useModule(ModuleActiveCoin);
    const subscribeToCoinInfo = useModule(ModuleSubscribeToCoinInfoOnCurrentStage);

    const coin = useSyncObservable(activeCoin$);

    const traceId = useTraceId();

    const coinInfo = useNotifiedValueDescriptorObservable(
        subscribeToCoinInfo(undefined, { traceId }),
    );

    const [tabs] = useCoinSelectionTabs();

    if (!isSyncedValueDescriptor(coinInfo) || !Array.isArray(tabs) || tabs.length === 0) {
        return null;
    }

    return (
        <CoinSelector
            className={className}
            coinInfo={coinInfo.value}
            coin={coin}
            onCoinChange={setActiveCoin}
            size={size}
            type={type}
            bordered={bordered}
        />
    );
}
