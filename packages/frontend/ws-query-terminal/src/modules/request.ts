import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleBaseActions } from '@frontend/common/src/modules/actions';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { FailFactory } from '@frontend/common/src/types/Fail';
import { tapOnce } from '@frontend/common/src/utils/Rx/tap';
import { tryDo } from '@frontend/common/src/utils/tryDo';
import {
    ExtractValueDescriptor,
    matchDesc,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import { isEmpty, isNil } from 'lodash-es';
import { BehaviorSubject, lastValueFrom, Observable, Subject, takeUntil, tap } from 'rxjs';

import { QueryResult } from '../domain/QueryResult';
import { ERequestQueryType } from '../domain/RequestQuery';
import { ModuleRequestQuery } from './requestQuery';

const QUERY_EXAMPLE = '{"type": "SubscribeToVirtualAccounts"}';
const ModuleQueriesFail = FailFactory('ModuleQueries');
const NOT_JSON = ModuleQueriesFail('NOT_JSON');
const EMPTY_QUERY = ModuleQueriesFail('EMPTY_QUERY');
const SOCKET_NOT_FOUND = ModuleQueriesFail('SOCKET_NOT_FOUND');
const UNKNOWN = ModuleQueriesFail('UNKNOWN');
const RequestState = ValueDescriptorFactory<
    true,
    typeof NOT_JSON | typeof EMPTY_QUERY | typeof SOCKET_NOT_FOUND
>();
const QueryResult = ValueDescriptorFactory<QueryResult, typeof UNKNOWN>();
type RequestStateValueDesc = ExtractValueDescriptor<typeof RequestState>;
type QueryResultValueDesc = ExtractValueDescriptor<typeof QueryResult>;

export const ModuleRequest = ModuleFactory((ctx) => {
    const { error } = ModuleNotifications(ctx);
    const { runCustomCommand, runCustomCommandRemote } = ModuleBaseActions(ctx);
    const { getCurrentSocket } = ModuleSocketPage(ctx);
    const { saveQuery } = ModuleRequestQuery(ctx);

    const currentQuery = new BehaviorSubject<string>(QUERY_EXAMPLE);
    const currentRequestState = new BehaviorSubject(RequestState.idle());
    const currentResult = new BehaviorSubject(QueryResult.sync([], null));
    const destroyer$ = new Subject<void>();

    function getQuery(): Observable<string> {
        return currentQuery;
    }

    function setQuery(query: string): void {
        stopQuery();
        currentQuery.next(query);
    }

    function runQuery(options: { shouldUseWorker: boolean }): void {
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

        const actionHandler = options.shouldUseWorker ? runCustomCommandRemote : runCustomCommand;

        currentRequestState.next(RequestState.unsc(null));
        currentResult.next(QueryResult.unsc(null));

        lastValueFrom(
            actionHandler(socketUrl, obj).pipe(
                tapOnce(
                    () =>
                        void saveQuery({
                            name: obj.type,
                            query: currentQuery.getValue(),
                            type: ERequestQueryType.Auto,
                        }),
                ),
                tap({
                    next: (res) => {
                        const currentStack = currentResult.getValue();
                        const result = matchDesc(currentStack, {
                            idle: () => QueryResult.sync(['--- message 1 ---', res], null),
                            unsynchronized: () =>
                                QueryResult.sync(['--- message 1 ---', res], null),
                            synchronized: (prev) => {
                                return QueryResult.sync(
                                    prev.concat(`--- message ${prev.length / 2 + 1} ---`, res),
                                    null,
                                );
                            },
                            fail: () => QueryResult.sync(['--- message 1 ---', res], null),
                        });
                        currentResult.next(result);
                        currentRequestState.next(RequestState.sync(true, null));
                    },
                    error: (err) => {
                        currentResult.next(QueryResult.sync(['--- err ---', err], null));
                    },
                }),
                takeUntil(destroyer$),
            ),
        ).finally(() => {
            currentRequestState.next(RequestState.idle());
        });
    }

    function stopQuery() {
        destroyer$.next();
    }

    function getResult(): Observable<QueryResultValueDesc> {
        return currentResult;
    }

    function clearResult(): void {
        currentResult.next(QueryResult.sync([], null));
    }

    function getRequestState(): Observable<RequestStateValueDesc> {
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
