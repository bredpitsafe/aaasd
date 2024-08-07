import { EApplicationName } from '@common/types';
import { isEmpty, isEqual, isNil } from 'lodash-es';
import { combineLatest, fromEvent } from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    first,
    map,
    switchMap,
    withLatestFrom,
} from 'rxjs/operators';

import { ECommonSettings } from '../components/Settings/def';
import type { TContextRef } from '../di';
import { ModuleApplicationName } from '../modules/applicationName';
import { ModuleLayouts } from '../modules/layouts';
import type { TPageLayouts } from '../modules/layouts/data';
import { EDefaultLayouts } from '../modules/layouts/def.ts';
import { ModuleLayoutRouter } from '../modules/router';
import { ETypicalSearchParams } from '../modules/router/defs.ts';
import { extractRouterParam } from '../modules/router/utils';
import { ModuleSettings } from '../modules/settings';
import { EDataLoadState } from '../types/loadState';
import { isLastFocusedTab$ } from '../utils/observable/isLastFocusedTab';
import { ModuleNotifyErrorAndFail } from '../utils/Rx/ModuleNotify.ts';
import { extractSyncedValueFromValueDescriptor } from '../utils/Rx/ValueDescriptor2.ts';

const KEY = 'layouts';
const EMPTY_LAYOUTS = {};

export function initLayoutsEffects(ctx: TContextRef, defaultLayouts: TPageLayouts) {
    const { state$ } = ModuleLayoutRouter(ctx);
    const { getAppSettings$ } = ModuleSettings(ctx);
    const { appName } = ModuleApplicationName(ctx);
    const notifyErrorAndFail = ModuleNotifyErrorAndFail(ctx);
    const {
        setLayoutsLoading,
        setLayouts,
        upsertTab,
        dropLayout,
        selectTab,
        setDefaultLayouts,
        hasDraft$,
        layoutsLoading$,
        activeLayoutId$,
        setSingleTabMode,
    } = ModuleLayouts(ctx);

    setLayoutsLoading(EDataLoadState.Loading);
    setDefaultLayouts(defaultLayouts);

    const syncLayouts$ = getAppSettings$(EApplicationName.Common, ECommonSettings.SyncLayouts).pipe(
        notifyErrorAndFail(),
        extractSyncedValueFromValueDescriptor(),
    );

    const pageLayouts$ = getAppSettings$(appName, KEY).pipe(
        notifyErrorAndFail(),
        extractSyncedValueFromValueDescriptor(),
    );

    // Restore layouts from settings
    pageLayouts$.pipe(first()).subscribe((layouts) => {
        setLayouts(layouts ?? EMPTY_LAYOUTS);
        setLayoutsLoading(EDataLoadState.Loaded);
    });

    // Sync from settings to layouts
    isLastFocusedTab$
        .pipe(
            first((v) => v),
            switchMap(() => pageLayouts$),
            map((layouts) => layouts ?? EMPTY_LAYOUTS),
            distinctUntilChanged<TPageLayouts>(isEqual),
            withLatestFrom(syncLayouts$),
            filter(([, syncLayouts]) => syncLayouts !== false),
        )
        .subscribe(([layouts]) => {
            setLayouts(layouts);
        });

    // Select tab based on `tab` and `createTab` URL params
    combineLatest([
        layoutsLoading$.pipe(filter((status) => !status)),
        activeLayoutId$.pipe(filter((layoutId) => !isNil(layoutId))),
    ])
        .pipe(
            switchMap(([loading, layoutId]) =>
                state$.pipe(
                    filter((state) => !isNil(state)),
                    map((state) => ({
                        loading,
                        layoutId,
                        tab: extractRouterParam(state.route, ETypicalSearchParams.Tab),
                        createTab: extractRouterParam(state.route, ETypicalSearchParams.CreateTab),
                        singleTab: extractRouterParam(state.route, ETypicalSearchParams.SingleTab),
                    })),
                    distinctUntilChanged(isEqual),
                ),
            ),
        )
        .subscribe(({ tab, createTab, singleTab, layoutId }) => {
            setSingleTabMode(Boolean(singleTab));

            // `SingleTab` layout has no tabs by default.
            // Every time it is loaded we must manually upsert a current tab into it.
            if (singleTab && layoutId === EDefaultLayouts.SingleTab) {
                dropLayout(EDefaultLayouts.SingleTab);
                if (!isEmpty(tab)) {
                    upsertTab(tab, { select: true });
                }
            }

            if (!isEmpty(tab)) {
                if (createTab) {
                    upsertTab(tab, { select: true });
                } else {
                    selectTab(tab);
                }
            }
        });

    let maybeWarnAboutUnsavedDraft: boolean | undefined;
    getAppSettings$(EApplicationName.Common, ECommonSettings.LayoutDraftUnsavedWarning)
        .pipe(notifyErrorAndFail(), extractSyncedValueFromValueDescriptor())
        .subscribe((value) => {
            maybeWarnAboutUnsavedDraft = Boolean(value);
        });

    fromEvent(window, 'beforeunload').subscribe((event) => {
        hasDraft$.subscribe((hasDraft) => {
            const warnAboutUnsavedDraft = maybeWarnAboutUnsavedDraft ?? true;
            if (hasDraft && warnAboutUnsavedDraft) {
                event.preventDefault();
                event.returnValue = true;
            }
        });
    });
}
