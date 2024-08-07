import { DollarOutlined } from '@ant-design/icons';
import {
    BalanceMonitorProps,
    EBalanceMonitorSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/balance-monitor.page.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { FloatButton } from '@frontend/common/src/components/FloatButton';
import { Select } from '@frontend/common/src/components/Select';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type {
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { BaseSelectRef } from 'rc-select/lib/BaseSelect';
import type { ComponentProps } from 'react';
import { memo, useRef } from 'react';

import { useCoinOptions } from '../../../hooks/useCoinOptions';
import { cnCoinSelectedIcon, cnFakeButton, cnSelect, cnWrapper } from './style.css';
import { useSelectStates } from './useSelectStates';

type TSelectProps = ComponentProps<typeof Select>;

export const CoinSelector = memo(
    ({
        className,
        type,
        size,
        bordered,
        coin,
        coinInfo,
        onCoinChange,
    }: TWithClassname & {
        coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>;
        coin: TCoinId | undefined;
        onCoinChange: (coin: TCoinId | undefined) => void;
        type: 'icon-label' | 'icon' | 'float';
        size: TSelectProps['size'];
        bordered?: TSelectProps['bordered'];
    }) => {
        const selectRef = useRef<BaseSelectRef>(null);

        const coinOptions = useCoinOptions(coinInfo);

        const {
            isActive,
            handleHover,
            handleUnHover,
            handleFocus,
            handleBlur,
            handleSetOpenedState,
        } = useSelectStates();

        const handleDropdownChange = useFunction((s: boolean) => {
            if (!s && selectRef.current !== null) {
                selectRef.current.blur();
            }

            handleSetOpenedState(s);
        });

        const ButtonComponent = type === 'float' ? FloatButton : Button;

        return type === 'icon-label' ? (
            <Select
                ref={selectRef}
                size={size}
                value={coin}
                showSearch
                allowClear
                options={coinOptions}
                onChange={onCoinChange}
                showArrow={false}
                onDropdownVisibleChange={handleDropdownChange}
                className={cn(cnSelect.static, className)}
                placeholder="Select coin filter"
                dropdownMatchSelectWidth={false}
            />
        ) : (
            <div className={cnWrapper}>
                <ButtonComponent
                    size={size}
                    icon={<DollarOutlined className={cn({ [cnCoinSelectedIcon]: !isNil(coin) })} />}
                    className={cnFakeButton}
                    tabIndex={-1}
                    type={type === 'float' ? undefined : bordered === false ? 'default' : undefined}
                />

                <Select
                    {...BalanceMonitorProps[EBalanceMonitorSelectors.CoinFilterSelector]}
                    ref={selectRef}
                    size={size}
                    value={coin}
                    showSearch
                    allowClear
                    options={coinOptions}
                    onChange={onCoinChange}
                    showArrow={false}
                    className={isActive ? cnSelect.active : cnSelect.idle}
                    onDropdownVisibleChange={handleDropdownChange}
                    dropdownMatchSelectWidth={false}
                    onFocus={handleFocus}
                    onMouseEnter={handleHover}
                    onBlur={handleBlur}
                    onMouseLeave={handleUnHover}
                    placeholder="Select coin filter"
                />
            </div>
        );
    },
);
