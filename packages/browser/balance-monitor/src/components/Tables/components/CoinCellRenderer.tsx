import { useModule } from '@frontend/common/src/di/react';
import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import type { ICellRendererParams } from 'ag-grid-community';
import { isNil } from 'lodash-es';
import { ForwardedRef, forwardRef, memo, MouseEvent, useMemo } from 'react';

import type { EBalanceMonitorLayoutComponents } from '../../../layouts/defs';
import { ModuleActiveCoin } from '../../../modules/ModuleActiveCoin';
import { CoinWithIcon } from '../../CoinWithIcon';
import { useCoinSelectionTabs } from '../../Settings/hooks/useCoinSelectionTabs';
import { useShowCoinIcons } from '../../Settings/hooks/useShowCoinIcons';
import { cnAnchor } from '../style.css';

export const CoinCellRenderer = memo(
    forwardRef(
        (
            {
                value: coin,
                api,
                tab,
            }: ICellRendererParams<unknown, TCoinId> & { tab?: EBalanceMonitorLayoutComponents },
            ref: ForwardedRef<HTMLElement>,
        ) => {
            const [showIcon] = useShowCoinIcons();
            const { activeCoin$, setActiveCoin } = useModule(ModuleActiveCoin);

            const selectedCoin = useSyncObservable(activeCoin$);

            const [tabs] = useCoinSelectionTabs();

            const syncTabWithActiveCoin = useMemo(
                () => !isNil(tab) && (tabs?.includes(tab) ?? false),
                [tabs, tab],
            );

            const handleClick = useFunction((event: MouseEvent<HTMLElement>) => {
                if (isNil(api) || isNil(coin)) {
                    return;
                }

                if (!syncTabWithActiveCoin && (isNil(tab) || event.ctrlKey || event.metaKey)) {
                    const filterInstance = api.getFilterInstance('coin');

                    const values = filterInstance?.getModel()?.values ?? [];

                    if (values.length === 1 && values[0] === coin) {
                        filterInstance?.setModel(null);
                    } else {
                        filterInstance?.setModel({ values: [coin] });
                    }

                    api.onFilterChanged();
                } else {
                    void setActiveCoin(
                        selectedCoin === coin && syncTabWithActiveCoin ? undefined : coin,
                    );
                }
            });

            if (isNil(coin)) {
                return null;
            }

            return (
                <CoinWithIcon
                    className={cnAnchor}
                    coin={coin}
                    showIcon={showIcon}
                    ref={ref}
                    onClick={handleClick}
                />
            );
        },
    ),
);
