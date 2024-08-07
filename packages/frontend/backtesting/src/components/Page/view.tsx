import {
    BacktestingProps,
    EBacktestingSelectors,
} from '@frontend/common/e2e/selectors/backtesting/backtesting.page.selectors';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { ReactElement } from 'react';

import { WidgetLayout } from '../../widgets/WidgetLayout';
import { cnContent, cnRoot } from './view.css';

type TDashboardViewProps = TWithClassname & {};

export function Page({}: TDashboardViewProps): ReactElement {
    return (
        <div {...BacktestingProps[EBacktestingSelectors.App]} className={cnRoot}>
            <WidgetLayout className={cnContent} />
        </div>
    );
}
