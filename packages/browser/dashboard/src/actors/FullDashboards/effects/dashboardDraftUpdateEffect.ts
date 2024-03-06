import type { TContextRef } from '@frontend/common/src/di';
import type { TStorageDashboardId } from '@frontend/common/src/types/domain/dashboardsStorage';
import { FailFactory } from '@frontend/common/src/types/Fail';
import type { Seconds } from '@frontend/common/src/types/time';
import { assertNever } from '@frontend/common/src/utils/assert';
import { switchMapDesc } from '@frontend/common/src/utils/Rx/desc';
import { seconds2milliseconds } from '@frontend/common/src/utils/time';
import {
    ExtractValueDescriptor,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import { BehaviorSubject, concat, Observable, of, OperatorFunction, Subject } from 'rxjs';
import {
    debounceTime,
    filter,
    groupBy,
    map,
    mergeMap,
    share,
    switchMap,
    takeWhile,
} from 'rxjs/operators';
import type { Actor, ActorContext } from 'webactor';

import type { TFullDashboard, TFullStorageDashboard } from '../../../types/fullDashboard';
import { isStorageDashboard } from '../../../types/fullDashboard/guards';
import { isReadonlyDashboardsStorageItem } from '../../../utils/dashboards';
import {
    convertDashboardToExportableDashboardConfig,
    convertDashboardToXml,
} from '../../../utils/dashboards/converters';
import {
    TUpdateServerDashboardDraftReturnType,
    updateDashboardDraft,
} from '../actions/dashboardsStorage/updateDashboardDraft';
import { updateDashboardDraftEnvBox } from '../envelope';
import type { TDashboardActionFailDesc, TWithTraceId } from '../types';
import { DashboardsMemoryCache } from './utils/DashboardsMemoryCache';
import type { UpdatesChecker } from './utils/UpdatesChecker';

const DEBOUNCE_UPDATE = seconds2milliseconds(1 as Seconds);

const createFail = FailFactory('UpdateDashboardDraft');
const descFactory = ValueDescriptorFactory<
    true,
    TDashboardActionFailDesc<'UpdateDashboardDraft'>
>();

export type TUpdateDashboardDraftReturnType = ExtractValueDescriptor<typeof descFactory>;

type TUpdateDraftTaskResponse = [TStorageDashboardId, TUpdateDashboardDraftReturnType];
type TUpdateDraftTaskOrCompleteResponse = [TStorageDashboardId, undefined];

export function dashboardDraftUpdateEffect(
    ctx: TContextRef,
    context: Actor | ActorContext,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    updatesChecker: UpdatesChecker,
) {
    const updatesQueue = new Subject<TWithTraceId<TFullStorageDashboard, 'fullDashboard'>>();

    const updateProcessor$ = updatesQueue.pipe(
        groupBy(({ fullDashboard }) => fullDashboard.storageDashboardItemKey.storageId),
        mergeMap((group) =>
            group.pipe(
                debounceTime(DEBOUNCE_UPDATE),
                switchMap(({ traceId, fullDashboard }) => {
                    const config = convertDashboardToXml(
                        convertDashboardToExportableDashboardConfig(fullDashboard.dashboard),
                    );

                    const { storageId } = fullDashboard.storageDashboardItemKey;

                    updatesChecker.registerUpdate(storageId, config);

                    return concat(
                        of([storageId, descFactory.idle()] as TUpdateDraftTaskResponse),
                        updateDashboardDraft(
                            ctx,
                            traceId,
                            fullDashboard.storageDashboardItemKey.storageId,
                            config,
                        ).pipe(convertDescToUpdateResult(storageId)),
                    );
                }),
            ),
        ),
        share(),
    );

    updateDashboardDraftEnvBox.responseStream(context, ({ traceId, fullDashboard }) => {
        if (
            !isStorageDashboard(fullDashboard) ||
            isReadonlyDashboardsStorageItem(fullDashboard.item)
        ) {
            const newFullDashboard = fullDashboard.item.hasDraft
                ? fullDashboard
                : ({
                      ...fullDashboard,
                      item: {
                          ...fullDashboard.item,
                          hasDraft: true,
                      },
                  } as TFullDashboard);

            memoryDashboardsSubject.next(
                DashboardsMemoryCache.set(memoryDashboardsSubject.getValue(), newFullDashboard),
            );

            return of(descFactory.sync(true, null));
        }

        memoryDashboardsSubject.next(
            DashboardsMemoryCache.set(memoryDashboardsSubject.getValue(), fullDashboard),
        );

        return new Observable<TUpdateDashboardDraftReturnType>((subscriber) => {
            const subscription = updateProcessor$
                .pipe(
                    filter(
                        ([storageId]) =>
                            storageId === fullDashboard.storageDashboardItemKey.storageId,
                    ),
                    takeWhile(([, updateDescriptor]) => updateDescriptor !== undefined),
                    map(
                        ([, updateDashboardDraftDescriptor]) =>
                            updateDashboardDraftDescriptor as TUpdateDashboardDraftReturnType,
                    ),
                )
                .subscribe(subscriber);

            updatesQueue.next({ traceId, fullDashboard });

            return subscription;
        });
    });
}

function convertDescToUpdateResult(
    storageId: TStorageDashboardId,
): OperatorFunction<
    TUpdateServerDashboardDraftReturnType,
    TUpdateDraftTaskResponse | TUpdateDraftTaskOrCompleteResponse
> {
    return switchMapDesc({
        idle: (): Observable<TUpdateDraftTaskResponse> => of([storageId, descFactory.idle()]),
        unsynchronized: (): Observable<TUpdateDraftTaskResponse> =>
            of([storageId, descFactory.unsc(null)]),
        synchronized: (): Observable<
            TUpdateDraftTaskResponse | TUpdateDraftTaskOrCompleteResponse
        > =>
            of(
                [storageId, descFactory.sync(true, null)] as TUpdateDraftTaskResponse,
                [storageId, undefined] as TUpdateDraftTaskOrCompleteResponse,
            ),
        fail: ({
            code,
            meta,
        }): Observable<TUpdateDraftTaskResponse | TUpdateDraftTaskOrCompleteResponse> => {
            let fail: TDashboardActionFailDesc<'UpdateDashboardDraft'>;

            switch (code) {
                case '[UpdateServerDashboardDraft]: UNKNOWN':
                    fail = createFail('UNKNOWN', meta);
                    break;
                case '[UpdateServerDashboardDraft]: NOT_FOUND':
                    fail = createFail('NOT_FOUND', meta);
                    break;
                case '[UpdateServerDashboardDraft]: AUTHORIZATION':
                    fail = createFail('AUTHORIZATION', meta);
                    break;
                case '[UpdateServerDashboardDraft]: SERVER_NOT_PROCESSED':
                    fail = createFail('SERVER_NOT_PROCESSED', meta);
                    break;
                default:
                    assertNever(code);
            }

            return of(
                [storageId, descFactory.fail(fail)] as TUpdateDraftTaskResponse,
                [storageId, undefined] as TUpdateDraftTaskOrCompleteResponse,
            );
        },
    });
}
