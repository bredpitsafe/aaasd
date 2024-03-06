import { Action, Actions, Model, TabNode } from 'flexlayout-react';
import type { ITitleObject } from 'flexlayout-react/src/view/Layout';
import { ReactElement, ReactNode, useLayoutEffect, useMemo } from 'react';
import { useObservable } from 'react-use';
import { EMPTY } from 'rxjs';

import { ErrorBoundary } from '../../components/ErrorBoundary';
import { FlexLayout } from '../../components/FlexLayout';
import { TabNodeRenderer } from '../../components/TabNodeRenderer/TabNodeRenderer';
import { useModule } from '../../di/react';
import { ModuleLayouts } from '../../modules/layouts';
import type { TLayoutId, TPageLayoutFactory } from '../../modules/layouts/data';
import { useFunction } from '../../utils/React/useFunction';
import { useSyncObservable } from '../../utils/React/useSyncObservable';

type TUseTwoPanelsLayoutReturnType = {
    model: Model | undefined;
    component: ReactElement;
    loading: boolean | undefined;
    onResetLayout: () => void;
};

type TUseLayoutProps = {
    layoutId: TLayoutId | undefined;
    factory: TPageLayoutFactory | undefined;
    onSelectTab?: (id: string) => void;
    useModel?: boolean;
    titleFactory?: (node: TabNode) => ITitleObject | ReactNode;
    nodeDestroyTimeout?: number;
};

// Timeout before child component will be unmounted due to not being visible in the layout.
const DEFAULT_NODE_DESTROY_TIMEOUT = 10 * 60_000;

export function useLayout(props: TUseLayoutProps): TUseTwoPanelsLayoutReturnType {
    const {
        layoutId,
        onSelectTab,
        useModel = true,
        titleFactory,
        nodeDestroyTimeout = DEFAULT_NODE_DESTROY_TIMEOUT,
    } = props;
    const { getLayoutModel$, upsertLayout, dropLayout, layoutsLoading$, setActiveLayoutId } =
        useModule(ModuleLayouts);

    useLayoutEffect(() => {
        if (useModel) {
            setActiveLayoutId(layoutId);
        }
    }, [setActiveLayoutId, layoutId, useModel]);

    // TODO: gently change to useSyncObservable, because its broke e2e tests
    // With useSyncObservable it force react render(into DOM) more than one active tab on fresh page load
    const loading = useObservable(layoutsLoading$);

    const cbResetLayout = useFunction(() => {
        layoutId && dropLayout(layoutId);
    });

    /* --- Sub layout configuration --- */
    const model = useSyncObservable(
        useMemo(() => (layoutId ? getLayoutModel$(layoutId) : EMPTY), [layoutId, getLayoutModel$]),
    );

    const cbModelChange = useFunction((newModel: Model, action: Action) => {
        // Ignore actions that don't lead to actual layout change
        if (action.type === Actions.SET_ACTIVE_TABSET) {
            return;
        }
        if (action.type === Actions.SELECT_TAB) {
            onSelectTab?.(action.data.tabNode);
            return;
        }
        const layout = newModel.toJson();
        return layoutId && upsertLayout(layoutId, layout);
    });

    const factory: TPageLayoutFactory = useFunction((node) => (
        <TabNodeRenderer visible={node.isVisible()} timeout={nodeDestroyTimeout}>
            {props.factory?.(node)}
        </TabNodeRenderer>
    ));

    const component = (
        <ErrorBoundary>
            {model && factory ? (
                <FlexLayout
                    model={model}
                    factory={factory}
                    onModelChange={cbModelChange}
                    titleFactory={titleFactory}
                />
            ) : null}
        </ErrorBoundary>
    );

    return {
        component,
        model,
        loading,
        onResetLayout: cbResetLayout,
    };
}
