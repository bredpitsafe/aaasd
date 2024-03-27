import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isSyncDesc, UnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { ComponentProps, ReactElement, useMemo } from 'react';

import { CoinSelector } from '../../components/Settings/components/StageSelect/CoinSelector';
import { useCoinSelectionTabs } from '../../components/Settings/hooks/useCoinSelectionTabs';
import { ModuleActiveCoin } from '../../modules/ModuleActiveCoin';
import { ModuleCoinInfo } from '../../modules/observables/ModuleCoinInfo';

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
    const { getCoinInfo$ } = useModule(ModuleCoinInfo);

    const coin = useSyncObservable(activeCoin$);

    const traceId = useTraceId();

    const coinInfo = useSyncObservable(
        getCoinInfo$(traceId),
        useMemo(() => UnscDesc(null), []),
    );

    const [tabs] = useCoinSelectionTabs();

    if (!isSyncDesc(coinInfo) || !Array.isArray(tabs) || tabs.length === 0) {
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
