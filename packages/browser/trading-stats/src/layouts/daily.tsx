import { Suspense } from '@frontend/common/src/components/Suspense';
import { createLayout } from '@frontend/common/src/modules/layouts/utils';
import { TabNode } from 'flexlayout-react';
import { memo, ReactElement } from 'react';
import { lazily } from 'react-lazily';

const { ConnectedARBTable } = lazily(
    () => import('../components/connectedComponents/ConnectedARBTable'),
);
const { ConnectedPNLTable } = lazily(
    () => import('../components/connectedComponents/ConnectedPNLTable'),
);
const { ConnectedDailyTradesTable } = lazily(
    () => import('../components/connectedComponents/ConnectedTradesTable'),
);

export enum EDailyStatsLayoutComponents {
    PNL = 'PNL',
    ARB = 'ARB',
    Trades = 'Trades',
}

export const dailyPageLayout = createLayout([
    {
        type: 'row',
        children: [
            {
                type: 'row',
                weight: 50,
                children: [
                    {
                        type: 'tabset',
                        weight: 50,
                        children: [
                            {
                                type: 'tab',
                                name: EDailyStatsLayoutComponents.PNL,
                                component: EDailyStatsLayoutComponents.PNL,
                                id: EDailyStatsLayoutComponents.PNL,
                            },
                        ],
                    },
                    {
                        type: 'tabset',
                        weight: 50,
                        children: [
                            {
                                type: 'tab',
                                name: EDailyStatsLayoutComponents.ARB,
                                component: EDailyStatsLayoutComponents.ARB,
                                id: EDailyStatsLayoutComponents.ARB,
                            },
                        ],
                    },
                ],
            },
            {
                type: 'tabset',
                weight: 50,
                children: [
                    {
                        type: 'tab',
                        name: EDailyStatsLayoutComponents.Trades,
                        component: EDailyStatsLayoutComponents.Trades,
                        id: EDailyStatsLayoutComponents.Trades,
                    },
                ],
            },
        ],
    },
]);

const DailyLayout = memo((props: { component: string | undefined }): ReactElement => {
    let element: ReactElement | null = null;
    switch (props.component) {
        case EDailyStatsLayoutComponents.PNL: {
            element = <ConnectedPNLTable />;
            break;
        }
        case EDailyStatsLayoutComponents.ARB: {
            element = <ConnectedARBTable />;
            break;
        }
        case EDailyStatsLayoutComponents.Trades: {
            element = <ConnectedDailyTradesTable />;
            break;
        }
    }

    return <Suspense component={props.component}>{element}</Suspense>;
});

export const getComponent = (node: TabNode): ReactElement => {
    const component = node.getComponent();

    return <DailyLayout component={component} />;
};
