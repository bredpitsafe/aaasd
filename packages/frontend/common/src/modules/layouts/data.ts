import { finalizeWithLastValue } from '@common/rx';
import type { TStructurallyCloneable } from '@common/types';
import type {
    Action,
    IJsonModel,
    IJsonTabNode,
    IJsonTabSetNode,
    Node,
    TabNode,
} from 'flexlayout-react';
import { Actions, DockLocation, Model } from 'flexlayout-react';
import { isEmpty, isEqual, isNil, isNull, isUndefined, omitBy } from 'lodash-es';
import type { ReactElement } from 'react';
import type { Observable } from 'rxjs';
import { combineLatest, lastValueFrom, of } from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    finalize,
    map,
    shareReplay,
    switchMap,
} from 'rxjs/operators';

import type { TContextRef } from '../../di/index.ts';
import { EDataLoadState } from '../../types/loadState';
import { EMPTY_ARRAY } from '../../utils/const';
import { isLoadingState } from '../../utils/loadState';
import { dedobs } from '../../utils/observable/memo';
import { createComputedBox, createObservableBox } from '../../utils/rx';
import { ModuleNotifyErrorAndFail } from '../../utils/Rx/ModuleNotify.ts';
import { isSyncedValueDescriptor, isValueDescriptor } from '../../utils/ValueDescriptor/utils.ts';
import { ModuleApplicationName } from '../applicationName/index.ts';
import { ModuleMessages } from '../messages/index.ts';
import { ModuleSettings } from '../settings/index.ts';
import { DEFAULT_LAYOUTS } from './def.ts';
import { ECommonComponents } from './index';
import {
    compareLayouts,
    createTabJson,
    getNewTabsetWeight,
    isTabNode,
    isTabSetNode,
} from './utils';

export const LAYOUT_ID_LEVEL_SEPARATOR = '::';

export type TLayoutId = string;

export type TPageLayout = {
    id: TLayoutId;
    value: IJsonModel;
    version?: number;
};
type TPageModel = {
    id: TLayoutId;
    value: Model;
    version?: number;
};
export type TPageLayouts = Record<TLayoutId, TPageLayout>;
export type TPageLayoutFactory = (node: TabNode) => ReactElement;
export enum EMaximizeState {
    Normal = 'Normal',
    Maximized = 'Maximized',
}

const KEY = 'layouts';

export function createModule(ctx: TContextRef) {
    const activeLayoutIdBox = createObservableBox<TLayoutId | undefined>(undefined);
    const boxLayouts = createObservableBox<TPageLayouts | undefined>(undefined);
    const boxSingleTabMode = createObservableBox<boolean>(false);
    let defaultLayouts = DEFAULT_LAYOUTS;
    const boxLayoutsLoadState = createObservableBox<EDataLoadState>(EDataLoadState.Idle);
    const draftBox = createObservableBox<TPageLayouts | null>(null);
    const boxModel = createComputedBox<Model | undefined>(
        activeLayoutIdBox.obs.pipe(
            distinctUntilChanged(),
            switchMap((activeLayoutId) =>
                isNil(activeLayoutId) ? of(undefined) : getLayoutModel$(activeLayoutId),
            ),
            shareReplay(1),
        ),
        undefined,
    );

    const { setAppSettings } = ModuleSettings(ctx);
    const notifyErrorAndFail = ModuleNotifyErrorAndFail(ctx);
    const messages = ModuleMessages(ctx);
    const { appName } = ModuleApplicationName(ctx);

    const layoutsLoading$ = boxLayoutsLoadState.obs.pipe(map(isLoadingState));

    function getLayout$(id: TLayoutId): Observable<TPageLayout | undefined> {
        return combineLatest([boxLayouts.obs, draftBox.obs]).pipe(
            filter((v): v is [TPageLayouts, TPageLayouts | null] => !isNil(v[0])),
            map(([saved, draft]) => findBestMatch(saved, draft, id)),
            distinctUntilChanged(isEqual),
        );
    }

    const getLayoutModel$ = dedobs(
        (id: TLayoutId): Observable<Model | undefined> =>
            getLayout$(id).pipe(
                map((layout: TPageLayout | undefined) =>
                    isNil(layout) ? undefined : Model.fromJson(layout.value),
                ),
                shareReplay(1),
            ),
        {
            normalize: ([id]) => id,
        },
    );

    function upsertLayout(id: TLayoutId, layout: IJsonModel): void {
        const version = findBestMatch({}, null, id)?.version;
        upsert({
            id,
            value: layout,
            version,
        });
    }

    function updateModel(actionFactory: (model: Model) => Action) {
        const pageModel = getActivePageModel();

        if (isNil(pageModel)) {
            return;
        }

        pageModel.value.doAction(actionFactory(pageModel.value));

        draftBox.set({
            ...draftBox.get(),
            [pageModel.id]: {
                id: pageModel.id,
                value: pageModel.value.toJson(),
                version: pageModel.version,
            },
        });
    }

    function dropLayout(id?: TLayoutId): void {
        remove(id);
    }

    function addTab(json: IJsonTabNode, location = DockLocation.RIGHT, select = false) {
        updateModel((model) =>
            Actions.addNode(json, model.getRoot().getId(), location, -1, select),
        );
    }

    function updateTab(id: string, json: Partial<IJsonTabNode | IJsonTabSetNode>) {
        updateModel(() => Actions.updateNodeAttributes(id, json));
    }

    function deleteTab(id: string) {
        const pageModel = getActivePageModel();

        if (isNil(pageModel)) {
            return;
        }

        // Check that tab or tabset can be deleted
        const node = pageModel.value.getNodeById(id);

        if (!isNil(node) && isTabNode(node) && node.isEnableClose()) {
            updateModel(() => Actions.deleteTab(node!.getId()));
        }
    }

    function deleteOtherTabs(id: string, inTabset = false) {
        const pageModel = getActivePageModel();
        const visitNode = (node: Node) => {
            const nodeId = node.getId();
            if (isTabNode(node) && node.isEnableClose() && id !== nodeId) {
                deleteTab(nodeId);
            }
        };

        if (isNil(pageModel)) {
            return;
        }
        // Delete other tabs in this tabset
        if (inTabset) {
            const node = pageModel.value.getNodeById(id);
            if (!isTabNode(node)) {
                return;
            }
            const parent = node.getParent();
            if (isNil(parent) || !isTabSetNode(parent)) {
                return;
            }
            parent.getChildren().forEach(visitNode);
        } else {
            // Delete all other tabs in the layout
            pageModel.value.visitNodes(visitNode);
        }
    }

    function upsertTab(
        id: string,
        options: {
            json?: IJsonTabNode;
            location?: DockLocation;
            select?: boolean;
            tabsetOptions?: Partial<{
                weight: number;
                maximize: EMaximizeState;
            }>;
        } = {},
    ) {
        const pageModel = getActivePageModel();

        if (isNil(pageModel)) {
            return;
        }

        const { json, location, select, tabsetOptions } = options;
        const tabConfig = {
            type: 'tab',
            id,
            name: id,
            component: id,
            ...json,
        };

        // Tab already exists, update its attributes
        if (!isNil(pageModel.value.getNodeById(id))) {
            if (select) {
                selectTab(id);
            }

            updateTab(id, tabConfig);
            toggleMaximize(id, tabsetOptions);
            return;
        }

        // Tab doesn't exist, create it, then apply additional properties.
        addTab(tabConfig, location, select);
        fixTabWidth(id, tabsetOptions);
        toggleMaximize(id, tabsetOptions);
    }

    function fixTabWidth(
        id: string,
        tabSetOptions?: Partial<{
            weight: number;
        }>,
    ) {
        const pageModel = getActivePageModel();

        if (isNil(pageModel)) {
            return;
        }

        const weight = getNewTabsetWeight(pageModel.value, tabSetOptions?.weight);
        const tabSetId = pageModel.value.getNodeById(id)?.getParent()?.getId();

        if (!isNil(tabSetId)) {
            updateTab(tabSetId, { weight });
        }
    }

    function toggleMaximize(
        id: string,
        tabSetOptions?: Partial<{
            maximize: EMaximizeState;
        }>,
    ) {
        const pageModel = getActivePageModel();

        if (isNil(pageModel)) {
            return;
        }
        const tabSet = pageModel.value.getNodeById(id)?.getParent();
        if (isNil(tabSet) || !isTabSetNode(tabSet)) {
            return;
        }

        if (
            (tabSet.isMaximized() && tabSetOptions?.maximize === EMaximizeState.Normal) ||
            (!tabSet.isMaximized() && tabSetOptions?.maximize === EMaximizeState.Maximized)
        ) {
            updateModel(() => Actions.maximizeToggle(tabSet?.getId()));
        }
    }

    function toggleTab(
        id: string,
        options: {
            json?: IJsonTabNode;
            location?: DockLocation;
            select?: boolean;
            tabsetOptions?: Partial<{
                weight: number;
                maximize: EMaximizeState;
            }>;
        } = {},
    ) {
        const pageModel = getActivePageModel();

        if (isNil(pageModel)) {
            return;
        }

        const { value: model } = pageModel;
        const node = model.getNodeById(id);

        if (isNil(node)) {
            upsertTab(id, options);
        } else {
            deleteTab(id);
        }
    }

    function selectTab(id: string) {
        updateModel(() => Actions.selectTab(id));
    }

    function getLayout(layout: TPageLayout): TPageLayout {
        const { id, value, version } = layout;
        const defaultLayout = findBestMatch({}, null, id)!;
        const global = defaultLayout.value.global;

        if (layout.version !== defaultLayout.version) {
            return defaultLayout;
        }

        return {
            id,
            value: {
                ...value,
                global,
            },
            version,
        };
    }

    function upsertTabFrame<TMeta>(id: string, name: string, url: string, meta?: TMeta): void {
        const json: IJsonTabNode = createTabJson(name, {
            component: ECommonComponents.Frame,
            config: {
                name,
                url,
                meta,
            },
        });

        upsertTab(id, {
            json,
            location: DockLocation.RIGHT,
            select: true,
        });
    }

    function upsertTabTask<T extends object>(task?: T): void {
        const json: IJsonTabNode = createTabJson(ECommonComponents.AddTask, {
            component: ECommonComponents.AddTask,
            config: {
                task,
            },
        });

        upsertTab(ECommonComponents.AddTask, {
            json,
            location: DockLocation.RIGHT,
            select: true,
            tabsetOptions: {
                maximize: EMaximizeState.Maximized,
            },
        });
    }

    function upsert(layout: TPageLayout): void {
        if (isNull(draftBox.get())) {
            draftBox.set({ ...boxLayouts.get(), [layout.id]: getLayout(layout) });
        } else {
            draftBox.set({ ...draftBox.get(), [layout.id]: getLayout(layout) });
        }
    }

    function remove(key?: TLayoutId): void {
        if (isNil(key)) {
            draftBox.set(defaultLayouts);
            return;
        }

        const defaultLayout = findBestMatch({}, null, key)!;
        if (isNull(draftBox.get())) {
            draftBox.set({ ...boxLayouts.get(), [key]: defaultLayout });
        } else {
            draftBox.set({ ...draftBox.get(), [key]: defaultLayout });
        }
    }

    function setDefaultLayouts(layouts: TPageLayouts): void {
        defaultLayouts = { ...defaultLayouts, ...layouts };
    }

    function getActivePageModel(): TPageModel | undefined {
        const id = activeLayoutIdBox.get();
        if (isNil(id)) {
            return undefined;
        }

        const saved = boxLayouts.get();

        if (isNil(saved)) {
            return undefined;
        }

        const draft = draftBox.get();

        const layout = findBestMatch(saved, draft, id);

        if (isNil(layout)) {
            return undefined;
        }

        return {
            id,
            value: Model.fromJson(layout.value),
            version: layout.version,
        };
    }

    function findBestMatchInSaved(saved: TPageLayouts, searchKey: string): TPageLayout | undefined {
        const searchKeySegments = searchKey.split(LAYOUT_ID_LEVEL_SEPARATOR);
        let currentLevel = searchKeySegments.length;
        let currentSearchKey = '';

        while (currentLevel > 0) {
            currentSearchKey = searchKeySegments
                .slice(0, currentLevel)
                .join(LAYOUT_ID_LEVEL_SEPARATOR);

            const layout = saved[currentSearchKey];

            if (!isNil(layout)) {
                return layout;
            }

            currentLevel -= 1;
        }

        return defaultLayouts[currentSearchKey] ?? undefined;
    }

    function findBestMatch(
        saved: TPageLayouts,
        draft: TPageLayouts | null,
        searchKey: string,
    ): TPageLayout | undefined {
        if (!isNull(draft) && searchKey in draft) return draft[searchKey];
        return findBestMatchInSaved(saved, searchKey);
    }

    function getRootLayoutId(layoutId: TLayoutId): TLayoutId {
        return layoutId.split(LAYOUT_ID_LEVEL_SEPARATOR)[0];
    }

    async function saveLayoutsToSettings(
        shouldShowNotification: boolean,
        layouts: TPageLayouts,
        layoutId?: TLayoutId,
    ) {
        const closeLoading = messages.loading('Updating layouts...', 10);
        await lastValueFrom(
            setAppSettings({
                appName,
                key: KEY,
                value: layouts as unknown as TStructurallyCloneable,
            }).pipe(
                notifyErrorAndFail(),
                finalize(closeLoading),
                finalizeWithLastValue((vd, error) => {
                    const isSyncedVD =
                        isUndefined(error) &&
                        (isValueDescriptor(vd) ? isSyncedValueDescriptor(vd) : true);
                    if (isSyncedVD) {
                        shouldShowNotification &&
                            messages.success('Layouts updated successfully', 1);

                        boxLayouts.set(layouts);

                        if (layoutId) {
                            const updatedDraft = omitBy(draftBox.get(), layoutId);
                            draftBox.set(isEmpty(updatedDraft) ? null : updatedDraft);
                        } else {
                            draftBox.set(null);
                        }
                    }
                }),
            ),
        );
    }

    const layoutsWithDraft$ = combineLatest([
        draftBox.obs,
        boxLayouts.obs.pipe(filter((v): v is TPageLayouts => !isUndefined(v))),
    ]).pipe(
        map(([draft, savedLayouts]) => {
            if (isNull(draft)) return EMPTY_ARRAY as Array<TLayoutId>;
            const result: Array<TLayoutId> = [];
            for (const [key, layout] of Object.entries(draft)) {
                const prevVersion = findBestMatchInSaved(savedLayouts, key);
                if (
                    isUndefined(prevVersion) ||
                    !compareLayouts(prevVersion.value.layout, layout.value.layout)
                ) {
                    result.push(key);
                }
            }
            return result;
        }),
        shareReplay(1),
    );

    return {
        model$: boxModel.obs,
        activeLayoutId$: activeLayoutIdBox.obs,
        setActiveLayoutId: activeLayoutIdBox.set,
        layoutsLoading$,
        setLayoutsLoading: boxLayoutsLoadState.set,
        layout$: boxLayouts.obs,
        getLayout$,
        setLayouts: boxLayouts.set,
        getLayoutModel$,
        getLayout,
        upsertLayout,
        dropLayout,
        addTab: (json: IJsonTabNode, location?: DockLocation, select?: boolean) =>
            void addTab(json, location, select),
        updateTab,
        upsertTab,
        deleteTab,
        deleteOtherTabs,
        selectTab,
        toggleTab,
        setDefaultLayouts,
        upsertTabTask,
        upsertTabFrame,
        saveDraft: async (layoutId?: TLayoutId, shouldShowNotification = true) => {
            const draft = draftBox.get();
            if (isNull(draft)) return;

            // When `layoutId` is set, allow for partial draft save (only for certain layout)
            if (!isNil(layoutId)) {
                const layout = draft[layoutId];
                if (isNil(layout)) return;

                await saveLayoutsToSettings(
                    shouldShowNotification,
                    { ...boxLayouts.get(), [layoutId]: layout },
                    layoutId,
                );
                return;
            }

            await saveLayoutsToSettings(shouldShowNotification, draft);
        },
        dropDraft: () => {
            draftBox.set(null);
            boxLayouts.set(boxLayouts.get());
        },
        hasDraft$: layoutsWithDraft$.pipe(
            map((layoutsWithDraft) => {
                if (isEmpty(layoutsWithDraft)) return false;
                return true;
            }),
        ),
        layoutsWithDraft$,
        getRootLayoutId,
        singleTabMode$: boxSingleTabMode.obs,
        setSingleTabMode: boxSingleTabMode.set,
        getSingleTabMode: boxSingleTabMode.get,
    };
}
