import { createLayout } from '@frontend/common/src/modules/layouts/utils';
import type { TabNode } from 'flexlayout-react';
import type { ReactElement } from 'react';

import { EDefaultLayoutComponents, TSMDefaultLayout } from './default';
export const serversPageLayout = createLayout([
    {
        type: 'tabset',
        children: [
            {
                type: 'tab',
                name: EDefaultLayoutComponents.Indicators,
                component: EDefaultLayoutComponents.Indicators,
                id: EDefaultLayoutComponents.Indicators,
            },
            {
                type: 'tab',
                name: EDefaultLayoutComponents.Instruments,
                component: EDefaultLayoutComponents.Instruments,
                id: EDefaultLayoutComponents.Instruments,
            },
            {
                type: 'tab',
                name: EDefaultLayoutComponents.ProductLogs,
                component: EDefaultLayoutComponents.ProductLogs,
                id: EDefaultLayoutComponents.ProductLogs,
            },
            {
                type: 'tab',
                name: EDefaultLayoutComponents.VirtualAccounts,
                component: EDefaultLayoutComponents.VirtualAccounts,
                id: EDefaultLayoutComponents.VirtualAccounts,
            },
            {
                type: 'tab',
                name: EDefaultLayoutComponents.RealAccounts,
                component: EDefaultLayoutComponents.RealAccounts,
                id: EDefaultLayoutComponents.RealAccounts,
            },
            {
                type: 'tab',
                name: EDefaultLayoutComponents.OrderBook,
                component: EDefaultLayoutComponents.OrderBook,
                id: EDefaultLayoutComponents.OrderBook,
            },
            {
                type: 'tab',
                name: EDefaultLayoutComponents.Positions,
                component: EDefaultLayoutComponents.Positions,
                id: EDefaultLayoutComponents.Positions,
            },
            {
                type: 'tab',
                name: EDefaultLayoutComponents.Balances,
                component: EDefaultLayoutComponents.Balances,
                id: EDefaultLayoutComponents.Balances,
            },
        ],
    },
]);

export const getComponent = (node: TabNode): ReactElement => {
    const component = node.getComponent();
    const id = node.getId();
    const config = node.getConfig();

    return <TSMDefaultLayout component={component} id={id} config={config} />;
};
