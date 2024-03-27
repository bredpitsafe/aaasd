import { isEmpty, isEqual, isNil } from 'lodash-es';
import { combineLatest, EMPTY, fromEvent, share } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    first,
    map,
    switchMap,
    take,
    withLatestFrom,
} from 'rxjs/operators';

import type { TSettingsStoreName } from '../actors/Settings/db';
import { ECommonSettings } from '../components/Settings/def';
import type { TContextRef } from '../di';
import { ModuleLayouts } from '../modules/layouts';
import type { TPageLayouts } from '../modules/layouts/data';
import { ModuleTypicalRouter } from '../modules/router';
import { extractRouterParam } from '../modules/router/utils';
import { ModuleSettings } from '../modules/settings';
import { EDataLoadState } from '../types/loadState';
import { EMPTY_OBJECT } from '../utils/const';
import { isLastFocusedTab$ } from '../utils/observable/isLastFocusedTab';

const KEY = 'layouts';
const SAVE_LAYOUT_DEBOUNCE = 1000;
const EMPTY_LAYOUTS = {};

export function initLayoutsEffects(
    ctx: TContextRef,
    defaultLayouts: TPageLayouts,
    storeName: TSettingsStoreName,
) {
    const { state$ } = ModuleTypicalRouter(ctx);
    const { getAppSettings$, setAppSettings } = ModuleSettings(ctx);
    const {
        layout$,
        setLayoutsLoading,
        setLayouts,
        upsertTab,
        selectTab,
        setDefaultLayouts,
        hasDraft$,
        layoutsLoading$,
        activeLayoutId$,
    } = ModuleLayouts(ctx);

    setLayoutsLoading(EDataLoadState.Loading);
    setDefaultLayouts(defaultLayouts);

    const syncLayouts$ = getAppSettings$<boolean>('common', ECommonSettings.SyncLayouts);

    const pageLayouts$ = getAppSettings$<TPageLayouts>(storeName, KEY).pipe(share());

    // Restore layouts from settings
    pageLayouts$.pipe(take(1)).subscribe((layouts) => {
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

    // Sync from layouts to settings with debounce
    isLastFocusedTab$
        .pipe(
            switchMap((focused) =>
                focused
                    ? layout$.pipe(
                          filter(
                              (v): v is TPageLayouts => !(isEmpty(v) || isEqual(v, EMPTY_OBJECT)),
                          ),
                          distinctUntilChanged(isEqual),
                          debounceTime(SAVE_LAYOUT_DEBOUNCE),
                      )
                    : EMPTY,
            ),
        )
        .subscribe((layouts) => {
            setAppSettings(storeName, KEY, layouts);
        });

    // Select tab based on `tab` and `createTab` URL params
    combineLatest([
        layoutsLoading$.pipe(filter((status) => !status)),
        activeLayoutId$.pipe(filter((layoutId) => !isNil(layoutId))),
    ])
        .pipe(
            switchMap(() =>
                state$.pipe(
                    filter((state) => !isNil(state)),
                    map((state) => ({
                        tab: extractRouterParam(state.route, 'tab'),
                        createTab: extractRouterParam(state.route, 'createTab'),
                    })),
                    filter(({ tab }) => !isEmpty(tab)),
                    distinctUntilChanged(isEqual),
                ),
            ),
        )
        .subscribe(({ tab, createTab }) => {
            if (createTab) {
                upsertTab(tab, { select: true });
            } else {
                selectTab(tab);
            }
        });

    let maybeWarnAboutUnsavedDraft: boolean | undefined;
    getAppSettings$<boolean>('common', ECommonSettings.LayoutDraftUnsavedWarning).subscribe(
        (value) => {
            maybeWarnAboutUnsavedDraft = value;
        },
    );

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
