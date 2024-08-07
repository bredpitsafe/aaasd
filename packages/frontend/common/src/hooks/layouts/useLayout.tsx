import type { Action, Model, TabNode } from 'flexlayout-react';
import { Actions } from 'flexlayout-react';
import type { ITitleObject } from 'flexlayout-react/src/view/Layout';
import type { ReactElement, ReactNode } from 'react';
import { useLayoutEffect, useMemo } from 'react';
import { useObservable } from 'react-use';
import { EMPTY } from 'rxjs';

import { createTestProps } from '../../../e2e';
import { ELayoutSelectors } from '../../../e2e/selectors/layout.selectors.ts';
import { FlexLayoutContainer } from '../../components/FlexLayout/FlexLayoutContainer.tsx';
import { FlexLayoutTabContainer } from '../../components/FlexLayout/FlexLayoutTabContainer.tsx';
import { useModule } from '../../di/react';
import { ModuleLayouts } from '../../modules/layouts';
import type { TLayoutId, TPageLayoutFactory } from '../../modules/layouts/data';
import { EDefaultLayouts } from '../../modules/layouts/def.ts';
import { useFunction } from '../../utils/React/useFunction';
import { useSyncObservable } from '../../utils/React/useSyncObservable';
import { useTabMouseActions } from './useTabMouseActions.ts';
import { useTitleFactory } from './useTitleFactory.tsx';

type TUseTwoPanelsLayoutReturnType = {
    model: Model | undefined;
    component: ReactElement | undefined;
    loading: boolean | undefined;
    onResetLayout: () => void;
};

export type TUseLayoutProps = {
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
        onSelectTab,
        useModel = true,
        nodeDestroyTimeout = DEFAULT_NODE_DESTROY_TIMEOUT,
    } = props;
    const {
        getLayoutModel$,
        upsertLayout,
        dropLayout,
        layoutsLoading$,
        setActiveLayoutId,
        singleTabMode$,
    } = useModule(ModuleLayouts);

    const singleTabMode = useSyncObservable(singleTabMode$, false);
    const layoutId = useMemo(
        () => (singleTabMode && useModel ? EDefaultLayouts.SingleTab : props.layoutId),
        [props.layoutId, singleTabMode, useModel],
    );

    useLayoutEffect(() => {
        if (useModel) {
            setActiveLayoutId(layoutId);
        }
    }, [setActiveLayoutId, layoutId, useModel, singleTabMode]);

    // TODO: gently change to useSyncObservable, because its broke e2e tests
    // With useSyncObservable it force react render(into DOM) more than one active tab on fresh page load
    const loading = useObservable(layoutsLoading$);

    const cbResetLayout = useFunction(() => {
        layoutId && dropLayout(layoutId);
    });

    const model = useSyncObservable(
        useMemo(() => {
            return layoutId ? getLayoutModel$(layoutId) : EMPTY;
        }, [layoutId, getLayoutModel$]),
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
        <FlexLayoutTabContainer node={node} factory={props.factory} timeout={nodeDestroyTimeout} />
    ));

    const titleFactory = useTitleFactory(props.titleFactory);
    const handleTabMouseEvents = useTabMouseActions();

    const component = (
        <FlexLayoutContainer
            model={model}
            factory={factory}
            onModelChange={cbModelChange}
            titleFactory={titleFactory}
            onAuxMouseClick={handleTabMouseEvents}
            {...createTestProps(`${ELayoutSelectors.LayoutContainer}_${layoutId}`)}
        />
    );

    return {
        component,
        model,
        loading,
        onResetLayout: cbResetLayout,
    };
}
