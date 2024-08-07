import { EModalProps, EModalSelectors } from '@frontend/common/e2e/selectors/modal.selectors';
import { SettingsSelector } from '@frontend/common/src/components/Settings/Selector';
import { memo } from 'react';

import { ALL_TABS_WITH_COINS, useCoinSelectionTabs } from './hooks/useCoinSelectionTabs';
import { cnTabsSelector } from './style.css';

const OPTIONS = ALL_TABS_WITH_COINS.map((tab) => ({
    label: tab,
    value: tab,
}));

export const CoinSelectionTabs = memo(() => {
    const [tabs, onChangeTabs, , loading] = useCoinSelectionTabs();

    return (
        <>
            <SettingsSelector
                {...EModalProps[EModalSelectors.TabsCoinFilterInput]}
                className={cnTabsSelector}
                labelSpan={10}
                label="Tabs with common coin filter"
                mode="multiple"
                value={tabs}
                onChange={onChangeTabs}
                options={OPTIONS}
                loading={loading}
                maxTagCount={1}
            />
        </>
    );
});
