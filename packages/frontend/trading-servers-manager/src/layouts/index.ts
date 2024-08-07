import { ECommonComponents } from '@frontend/common/src/modules/layouts';
import type {
    TLayoutId,
    TPageLayoutFactory,
    TPageLayouts,
} from '@frontend/common/src/modules/layouts/data';

import { EDefaultLayoutComponents } from './default';
import {
    EPageGatesLayoutComponents,
    gatesPageLayout,
    getComponent as getGatesFactory,
} from './gate';
import { createGlobalLayout } from './global';
import {
    EPageHerodotusLayoutComponents,
    getComponent as getHerodotusLayoutFactory,
    herodotusPageLayout,
} from './herodotus';
import {
    EPageRobotsLayoutComponents,
    getComponent as getRobotsFactory,
    robotsPageLayout,
} from './robot';
import { getComponent as getServersFactory, serversPageLayout } from './server';

export enum ELayoutIds {
    Global = 'Global',
    PageRobots = 'PageRobots',
    PageHerodotus = 'PageHerodotus',
    PageServers = 'PageServers',
    PageGates = 'PageGates',
}

export const DEFAULT_LAYOUTS: TPageLayouts = {
    [ELayoutIds.Global]: {
        id: ELayoutIds.Global,
        value: createGlobalLayout(),
        version: 2,
    },
    [ELayoutIds.PageServers]: {
        id: ELayoutIds.PageServers,
        value: serversPageLayout,
        version: 3,
    },
    [ELayoutIds.PageGates]: {
        id: ELayoutIds.PageGates,
        value: gatesPageLayout,
        version: 1,
    },
    [ELayoutIds.PageRobots]: {
        id: ELayoutIds.PageRobots,
        value: robotsPageLayout,
        version: 3,
    },
    [ELayoutIds.PageHerodotus]: {
        id: ELayoutIds.PageHerodotus,
        value: herodotusPageLayout,
        version: 2,
    },
};

export function getSubLayoutFactory(id: TLayoutId): TPageLayoutFactory {
    switch (id) {
        case ELayoutIds.PageGates: {
            return getGatesFactory;
        }
        case ELayoutIds.PageRobots: {
            return getRobotsFactory;
        }
        case ELayoutIds.PageHerodotus: {
            return getHerodotusLayoutFactory;
        }
        case ELayoutIds.Global:
        case ELayoutIds.PageServers:
        default: {
            return getServersFactory;
        }
    }
}

export function getLayoutComponents(id?: TLayoutId): string[] {
    const defaultComponents: string[] = [
        EDefaultLayoutComponents.Indicators,
        EDefaultLayoutComponents.Instruments,
        EDefaultLayoutComponents.ProductLogs,
        EDefaultLayoutComponents.VirtualAccounts,
        EDefaultLayoutComponents.RealAccounts,
        EDefaultLayoutComponents.OrderBook,
        EDefaultLayoutComponents.WsRequest,
        EDefaultLayoutComponents.Positions,
        EDefaultLayoutComponents.Balances,
    ];
    switch (id) {
        case ELayoutIds.Global:
        case ELayoutIds.PageServers: {
            return defaultComponents;
        }
        case ELayoutIds.PageGates: {
            return defaultComponents.concat(Object.values(EPageGatesLayoutComponents));
        }
        case ELayoutIds.PageRobots: {
            return defaultComponents.concat(Object.values(EPageRobotsLayoutComponents));
        }
        case ELayoutIds.PageHerodotus: {
            return defaultComponents.concat(
                Object.values(EPageRobotsLayoutComponents),
                Object.values(EPageHerodotusLayoutComponents),
                [ECommonComponents.AddTask],
            );
        }
        default: {
            return defaultComponents;
        }
    }
}
