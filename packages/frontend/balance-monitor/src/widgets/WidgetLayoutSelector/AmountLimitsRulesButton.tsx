import { VerticalAlignTopOutlined } from '@ant-design/icons';
import {
    BalanceMonitorProps,
    EBalanceMonitorSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/balance-monitor.page.selectors';
import { ENavType } from '@frontend/common/src/actors/Settings/types';
import { Button } from '@frontend/common/src/components/Button';
import { FloatButton } from '@frontend/common/src/components/FloatButton';
import { memo } from 'react';

import { cnFullWidth } from './view.css';

const TITLE = 'Amount Limits Rules';

export const AmountLimitsRulesButton = memo(
    ({ selected, type }: { selected: boolean; type: ENavType }) => {
        if (type === ENavType.Hidden) {
            return (
                <FloatButton
                    tooltip={TITLE}
                    icon={<VerticalAlignTopOutlined />}
                    type={selected ? 'primary' : 'default'}
                />
            );
        }

        return (
            <Button
                {...BalanceMonitorProps[EBalanceMonitorSelectors.AmountLimitsRulesButton]}
                className={cnFullWidth}
                title={TITLE}
                icon={<VerticalAlignTopOutlined />}
                type={selected ? 'primary' : 'default'}
            >
                {type === ENavType.Full ? TITLE : undefined}
            </Button>
        );
    },
);
