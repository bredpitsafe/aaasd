import {
    BalanceMonitorProps,
    EBalanceMonitorSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/balance-monitor.page.selectors';
import type { ReactElement } from 'react';

import { ConnectedLayout } from './components/ConnectedLayout';
import { cnContent, cnRoot } from './view.css';

export function Page(): ReactElement {
    return (
        <div {...BalanceMonitorProps[EBalanceMonitorSelectors.App]} className={cnRoot}>
            <ConnectedLayout className={cnContent} />
        </div>
    );
}
