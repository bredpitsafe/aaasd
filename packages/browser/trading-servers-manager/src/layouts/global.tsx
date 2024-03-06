import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { Suspense } from '@frontend/common/src/components/Suspense';
import { TPageLayoutFactory } from '@frontend/common/src/modules/layouts/data';
import { IJsonModel, TabNode } from 'flexlayout-react';
import { memo, ReactElement, ReactNode } from 'react';
import { lazily } from 'react-lazily';

const { WidgetMenu } = lazily(() => import('../widgets/WidgetMenu/WidgetMenu'));

export enum EGlobalLayoutComponents {
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
                    width: 400,
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

export function createGlobalLayoutWithoutMenu(): IJsonModel {
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

const TSMGlobalLayout = memo(
    (props: {
        component: string | undefined;
        child: ReactNode;
        loading?: boolean;
    }): ReactElement => {
        const { component, child, loading } = props;
        let element: ReactNode | null = null;
        switch (component) {
            case EGlobalLayoutComponents.Menu: {
                element = <WidgetMenu />;
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

        return <Suspense component={props.component}>{element}</Suspense>;
    },
);

export function createGlobalComponentFactory(
    child: ReactNode,
    loading?: boolean,
): TPageLayoutFactory {
    return (node: TabNode): ReactElement => {
        const component = node.getComponent();
        return <TSMGlobalLayout component={component} child={child} loading={loading} />;
    };
}
