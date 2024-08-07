import { orange } from '@ant-design/colors';
import { StockOutlined } from '@ant-design/icons';
import {
    BalanceMonitorProps,
    EBalanceMonitorSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/balance-monitor.page.selectors';
import { Badge } from '@frontend/common/src/components/Badge';
import { Button } from '@frontend/common/src/components/Button';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { memo } from 'react';

import { cnFullWidth } from './view.css';

const TITLE = 'Pump & Dump';

export const PumpAndDump = memo(
    ({
        className,
        collapsed,
        flaggedCoinCount,
        togglePumpAndDump,
    }: TWithClassname & {
        collapsed: boolean;
        flaggedCoinCount: number;
        togglePumpAndDump: VoidFunction;
    }) => (
        <div
            {...BalanceMonitorProps[EBalanceMonitorSelectors.PumpAndDumpButton]}
            className={className}
        >
            <Badge className={cnFullWidth} color={orange[5]} count={flaggedCoinCount}>
                <Button
                    className={cnFullWidth}
                    title={TITLE}
                    icon={<StockOutlined />}
                    onClick={togglePumpAndDump}
                >
                    {collapsed ? undefined : TITLE}
                </Button>
            </Badge>
        </div>
    ),
);
