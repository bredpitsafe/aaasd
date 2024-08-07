import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { Suspense } from '@frontend/common/src/components/Suspense';
import type { TPageLayoutFactory } from '@frontend/common/src/modules/layouts/data';
import type { IJsonModel, TabNode } from 'flexlayout-react';
import type { ReactElement, ReactNode } from 'react';
import { memo } from 'react';

import { WidgetFilter } from '../widgets/Filter.tsx';

enum EGlobalLayoutComponents {
    Menu = 'Menu',
    SubLayout = 'SubLayout',
}

export function createGlobalLayout(): IJsonModel {
    return {
        global: {
            tabEnableClose: false,
            tabSetEnableTabStrip: false,
            tabEnableRename: false,
            tabSetEnableDrop: false,
            tabSetEnableDrag: false,
            tabSetEnableDivide: false,
            tabSetEnableClose: false,
        },
        borders: [],
        layout: {
            type: 'row',
            weight: 100,
            children: [
                {
                    type: 'tabset',
                    width: 340,
                    children: [
                        {
                            type: 'tab',
                            id: EGlobalLayoutComponents.Menu,
                            name: EGlobalLayoutComponents.Menu,
                            component: EGlobalLayoutComponents.Menu,
                        },
                    ],
                },
                {
                    type: 'tabset',
                    children: [
                        {
                            type: 'tab',
                            id: EGlobalLayoutComponents.SubLayout,
                            name: EGlobalLayoutComponents.SubLayout,
                            component: EGlobalLayoutComponents.SubLayout,
                        },
                    ],
                },
            ],
        },
    };
}

const GlobalTradingStatsLayout = memo(
    (props: {
        component: string | undefined;
        child: ReactNode;
        loading?: boolean;
    }): ReactElement => {
        const { component, child, loading } = props;
        let element: ReactNode | null = null;
        switch (component) {
            case EGlobalLayoutComponents.Menu: {
                element = <WidgetFilter />;
                break;
            }
            case EGlobalLayoutComponents.SubLayout: {
                if (loading) {
                    element = <LoadingOverlay text="Loading layout..." />;
                } else {
                    element = child;
                }
                break;
            }
        }

        return <Suspense component={component}>{element}</Suspense>;
    },
);

export function createGlobalComponentFactory(
    child: ReactNode,
    loading?: boolean,
): TPageLayoutFactory {
    return (node: TabNode): ReactElement => {
        const component = node.getComponent();
        return <GlobalTradingStatsLayout component={component} loading={loading} child={child} />;
    };
}
