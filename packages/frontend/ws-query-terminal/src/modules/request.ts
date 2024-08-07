import { tapOnce } from '@common/rx';
import { generateTraceId } from '@common/utils';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleRunCustomCommand } from '@frontend/common/src/modules/actions/ModuleRunCustomCommand.ts';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { tryDo } from '@frontend/common/src/utils/tryDo';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    EMPTY_VD,
    REQUESTING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEmpty, isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { BehaviorSubject, lastValueFrom, Subject, takeUntil, tap } from 'rxjs';

import type { TQueryResult } from '../types';
import { ERequestQueryType } from '../types';
import { ModuleRequestQuery } from './requestQuery';

const QUERY_EXAMPLE = '{"type": "SubscribeToVirtualAccounts"}';

export enum ERequestState {
    Idle = 'idle',
    Error = 'error',
    Requesting = 'loading',
    Receiving = 'Receiving',
}

export const ModuleRequest = ModuleFactory((ctx) => {
    const { error } = ModuleNotifications(ctx);
    const runCustomCommand = ModuleRunCustomCommand(ctx);
    const { getCurrentSocket } = ModuleSocketPage(ctx);
    const { saveQuery } = ModuleRequestQuery(ctx);

    const currentQuery = new BehaviorSubject<string>(QUERY_EXAMPLE);
    const currentRequestState = new BehaviorSubject<ERequestState>(ERequestState.Idle);
    const currentResult = new BehaviorSubject<TValueDescriptor2<TQueryResult>>(EMPTY_VD);
    const destroyer$ = new Subject<void>();

    function getQuery(): Observable<string> {
        return currentQuery;
    }

    function setQuery(query: string): void {
        stopQuery();
        currentQuery.next(query);
    }

    function runQuery(): void {
        const [err, obj] = tryDo(() => JSON.parse(currentQuery.getValue()));

        if (err) {
            error({
                message: `Can't convert request to JSON`,
                description: err.toString(),
            });
            return;
        }

        if (isNil(obj) || isEmpty(obj)) {
            error({
                message: `Payload is empty`,
            });
            return;
        }

        const socketUrl = getCurrentSocket()?.url;

        if (isNil(socketUrl)) {
            error({
                message: 'Stage required',
                description: 'Please select a stage to continue',
            });
            return;
        }

        currentRequestState.next(ERequestState.Requesting);
        currentResult.next(REQUESTING_VD);

        lastValueFrom(
            runCustomCommand(
                { target: socketUrl, payload: obj },
                { traceId: generateTraceId() },
            ).pipe(
                tapOnce(() => {
                    currentRequestState.next(ERequestState.Receiving);

                    void saveQuery({
                        name: obj.type,
                        query: currentQuery.getValue(),
                        type: ERequestQueryType.Auto,
                    });
                }),
                tap({
                    next: (res) => {
                        const prev = currentResult.getValue().value ?? [];

                        currentResult.next(
                            createSyncedValueDescriptor(
                                prev.concat(`--- message ${prev.length / 2 + 1} ---`, res),
                            ),
                        );
                    },
                    error: (err) => {
                        currentRequestState.next(ERequestState.Error);
                        currentResult.next(createSyncedValueDescriptor(['--- err ---', err]));
                    },
                }),
                takeUntil(destroyer$),
            ),
        ).finally(() => {
            currentRequestState.next(ERequestState.Idle);
        });
    }

    function stopQuery() {
        destroyer$.next();
    }

    function getResult(): Observable<TValueDescriptor2<TQueryResult>> {
        return currentResult;
    }

    function clearResult(): void {
        currentResult.next(EMPTY_VD);
    }

    function getRequestState(): Observable<ERequestState> {
        return currentRequestState;
    }

    function saveRequestQuery({ name }: { name: string }) {
        saveQuery({ name, query: currentQuery.getValue(), type: ERequestQueryType.Manual });
    }

    return {
        query$: currentQuery,
        getQuery,
        setQuery,
        runQuery,
        stopQuery,
        getResult,
        clearResult,
        getRequestState,
        saveRequestQuery,
    };
});
