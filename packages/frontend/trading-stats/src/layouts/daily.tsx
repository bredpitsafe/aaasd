import { Suspense } from '@frontend/common/src/components/Suspense';
import { createLayout } from '@frontend/common/src/modules/layouts/utils';
import type { TabNode } from 'flexlayout-react';
import type { ReactElement } from 'react';
import { memo } from 'react';
import { lazily } from 'react-lazily';

const { WidgetARBTable } = lazily(() => import('../widgets/ARBTable.tsx'));
const { WidgetPNLTable } = lazily(() => import('../widgets/PNLTable.tsx'));
const { WidgetTradesTable } = lazily(() => import('../widgets/TradesTable.tsx'));

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
            element = <WidgetPNLTable />;
            break;
        }
        case EDailyStatsLayoutComponents.ARB: {
            element = <WidgetARBTable />;
            break;
        }
        case EDailyStatsLayoutComponents.Trades: {
            element = <WidgetTradesTable />;
            break;
        }
    }

    return <Suspense component={props.component}>{element}</Suspense>;
});

export const getComponent = (node: TabNode): ReactElement => {
    const component = node.getComponent();

    return <DailyLayout component={component} />;
};
