import { Suspense } from '@frontend/common/src/components/Suspense';
import { createLayout } from '@frontend/common/src/modules/layouts/utils';
import type { TabNode } from 'flexlayout-react';
import type { ReactElement } from 'react';
import { memo } from 'react';
import { lazily } from 'react-lazily';

const { WidgetARBFeesTable } = lazily(() => import('../widgets/ARBFeesTable.tsx'));
const { WidgetARBMakerTable } = lazily(() => import('../widgets/ARBMakerTable.tsx'));
const { WidgetARBTakerTable } = lazily(() => import('../widgets/ARBTakerTable.tsx'));
const { WidgetARBVolumeTable } = lazily(() => import('../widgets/ARBVolumeTable.tsx'));
const { WidgetMonthlyStats } = lazily(() => import('../widgets/MonthlyStats.tsx'));
const { WidgetProfitsTable } = lazily(() => import('../widgets/ProfitsTable.tsx'));

export enum EMonthlyStatsLayoutComponents {
    Profits = 'Profits',
    ARBVolume = 'ARB Volume',
    ARBMaker = 'ARB Maker',
    ARBTaker = 'ARB Taker',
    ARBFees = 'ARB Fees',
    MonthlyStats = 'Monthly Stats',
}

const MonthlyLayout = memo((props: { component: string | undefined }): ReactElement => {
    let element: ReactElement | null = null;

    switch (props.component) {
        case EMonthlyStatsLayoutComponents.Profits: {
            element = <WidgetProfitsTable />;
            break;
        }
        case EMonthlyStatsLayoutComponents.ARBTaker: {
            element = <WidgetARBMakerTable />;
            break;
        }
        case EMonthlyStatsLayoutComponents.ARBMaker: {
            element = <WidgetARBTakerTable />;
            break;
        }
        case EMonthlyStatsLayoutComponents.ARBVolume: {
            element = <WidgetARBVolumeTable />;
            break;
        }
        case EMonthlyStatsLayoutComponents.ARBFees: {
            element = <WidgetARBFeesTable />;
            break;
        }
        case EMonthlyStatsLayoutComponents.MonthlyStats: {
            element = <WidgetMonthlyStats />;
            break;
        }
    }

    return <Suspense component={props.component}>{element}</Suspense>;
});

export const monthlyPageLayout = createLayout([
    {
        type: 'tabset',
        children: [
            {
                type: 'tab',
                name: EMonthlyStatsLayoutComponents.MonthlyStats,
                component: EMonthlyStatsLayoutComponents.MonthlyStats,
                id: EMonthlyStatsLayoutComponents.MonthlyStats,
            },
        ],
    },
]);

export const getComponent = (node: TabNode): ReactElement => {
    const component = node.getComponent();
    return <MonthlyLayout component={component} />;
};
