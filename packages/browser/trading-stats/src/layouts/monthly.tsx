import { Suspense } from '@frontend/common/src/components/Suspense';
import { createLayout } from '@frontend/common/src/modules/layouts/utils';
import { TabNode } from 'flexlayout-react';
import { memo, ReactElement } from 'react';
import { lazily } from 'react-lazily';

const { ConnectedARBFeesTable } = lazily(
    () => import('../components/connectedComponents/ConnectedARBFeesTable'),
);
const { ConnectedARBMakerTable } = lazily(
    () => import('../components/connectedComponents/ConnectedARBMakerTable'),
);
const { ConnectedARBTakerTable } = lazily(
    () => import('../components/connectedComponents/ConnectedARBTakerTable'),
);
const { ConnectedARBVolumeTable } = lazily(
    () => import('../components/connectedComponents/ConnectedARBVolumeTable'),
);
const { ConnectedMonthlyStats } = lazily(
    () => import('../components/connectedComponents/ConnectedMonthlyStats'),
);
const { ConnectedProfitsTable } = lazily(
    () => import('../components/connectedComponents/ConnectedProfitsTable'),
);

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
            element = <ConnectedProfitsTable />;
            break;
        }
        case EMonthlyStatsLayoutComponents.ARBTaker: {
            element = <ConnectedARBMakerTable />;
            break;
        }
        case EMonthlyStatsLayoutComponents.ARBMaker: {
            element = <ConnectedARBTakerTable />;
            break;
        }
        case EMonthlyStatsLayoutComponents.ARBVolume: {
            element = <ConnectedARBVolumeTable />;
            break;
        }
        case EMonthlyStatsLayoutComponents.ARBFees: {
            element = <ConnectedARBFeesTable />;
            break;
        }
        case EMonthlyStatsLayoutComponents.MonthlyStats: {
            element = <ConnectedMonthlyStats />;
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
