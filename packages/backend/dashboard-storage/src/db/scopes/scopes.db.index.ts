import type { TraceId } from '@common/utils';
import {
    assertNever,
    embedContextToMessage,
    generateTraceId,
    shortenLoggingArray,
    withTimeout,
} from '@common/utils';
import { groupBy, isEmpty, isEqual, isNil, mapValues, omit } from 'lodash-es';
import { distinctUntilChanged, map, switchMap } from 'rxjs';

import { EActorName } from '../../def/actor.ts';
import type { Scope } from '../../def/request.ts';
import type { TScope } from '../../def/scope.ts';
import { validateScopeObject } from '../../modules/scopes/utils.ts';
import { defaultLogger } from '../../utils/logger.ts';
import { ETable } from '../constants.ts';
import { client } from '../postgres/index.ts';
import { subscribeToTableUpdates } from '../subscription.ts';
import { parseScope } from './scopes.utils.ts';

type TScopeUpdate = Pick<TScope, 'dashboardId' | 'sortedScopeEntries'> & {
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
};

type TScopeFilters = {
    include?: {
        scopes?: Scope[];
        dashboardIds?: string[];
    };
    exclude?: {
        scopes?: Scope[];
        dashboardIds?: string[];
    };
};

type TIndexedScopeItem = TScope & { scope: Scope };
type TIndexKey = `${TScope['dashboardId']}:${TScope['sortedScopeEntries']}`;

const { messageWithContext } = embedContextToMessage('ScopesIndex');

const scopeUpdatesTrigger$ = subscribeToTableUpdates<TScopeUpdate>('scopes_updates');

class ScopesIndex {
    // TODO: rework index to Map<TScope['dashboardId'], Map<TScope['sortedScopeEntries'], TIndexedScopeItem>>()
    // to be able to speed up getScopesGroupedByIds by replacing it into getScopesBy(dashboardId) to get scopes in O(1)
    private scopeIndex = new Map<TIndexKey, TIndexedScopeItem>();
    private indexInitialized: Promise<void> | undefined;
    private logger = defaultLogger.createChildLogger({ actor: EActorName.Scopes });

    constructor() {
        this.init();
    }

    private async init() {
        const traceId = generateTraceId();

        let resolveIndexInitializedPromise: () => void = () => {};
        this.indexInitialized = withTimeout(
            new Promise<void>((resolve) => {
                resolveIndexInitializedPromise = resolve;
            }),
        );

        const scopeRows = await this.loadScopes();

        scopeRows.forEach((scopeRow) => {
            this.index(scopeRow, traceId);
        });

        this.watchScopeUpdates();

        resolveIndexInitializedPromise();

        this.logger.info({
            message: messageWithContext('Index initialized'),
            traceId,
            scopeRows: shortenLoggingArray(scopeRows),
        });
    }

    private async loadScopes() {
        const scopeRows = await client.query<TScope>({
            query: `SELECT * from ${ETable.Scopes}`,
        });

        return scopeRows;
    }

    private index(scopeRow: TScope, traceId: TraceId) {
        this.scopeIndex.set(this.buildKey(scopeRow), {
            ...scopeRow,
            scope: parseScope(scopeRow.sortedScopeEntries),
        });

        this.logger.info({ message: messageWithContext('indexed scopeRow'), scopeRow, traceId });
    }

    private removeBinding(scopeRow: TScope, traceId: TraceId) {
        this.scopeIndex.delete(this.buildKey(scopeRow));

        this.logger.info({
            message: messageWithContext('removed scope binding'),
            scopeRow,
            traceId,
        });
    }

    private buildKey(scopeRow: TScope): TIndexKey {
        return `${scopeRow.dashboardId}:${scopeRow.sortedScopeEntries}`;
    }

    private async getScopeRows(filters: TScopeFilters, traceId: TraceId) {
        const logger = this.logger.createChildLogger({ traceId });

        logger.debug({
            message: messageWithContext(`${this.getScopeRows.name} called`),
            filters,
            traceId,
        });

        await this.indexInitialized;

        const includeScopes = filters.include?.scopes || [];
        const excludeScopes = filters.exclude?.scopes || [];
        [...includeScopes, ...excludeScopes].forEach(validateScopeObject);
        const includeDashboardIds = filters.include?.dashboardIds || [];
        const excludeDashboardIds = filters.exclude?.dashboardIds || [];

        const indexScopeRows = Array.from(this.scopeIndex.values());
        logger.debug({
            traceId,
            message: messageWithContext('index list'),
            indexList: shortenLoggingArray(indexScopeRows),
            includeScopes,
            excludeScopes,
        });

        const filteredScopeRows = indexScopeRows.filter((scopeRow) => {
            const includeScopesMatch =
                isEmpty(includeScopes) ||
                includeScopes.some((includeScope) =>
                    Object.keys(includeScope).every(
                        (includeScopeKey) =>
                            includeScopeKey in scopeRow.scope &&
                            includeScope[includeScopeKey] === scopeRow.scope[includeScopeKey],
                    ),
                );

            const excludeScopesMatch =
                isEmpty(excludeScopes) ||
                !excludeScopes.some((excludeScope) =>
                    Object.keys(excludeScope).every(
                        (excludeScopeKey) =>
                            excludeScopeKey in scopeRow.scope &&
                            excludeScope[excludeScopeKey] === scopeRow.scope[excludeScopeKey],
                    ),
                );

            const includeDashboardIdsMatch =
                isEmpty(includeDashboardIds) || includeDashboardIds.includes(scopeRow.dashboardId);
            const excludeDashboardIdsMatch =
                isEmpty(excludeDashboardIds) || !excludeDashboardIds.includes(scopeRow.dashboardId);

            return (
                includeScopesMatch &&
                excludeScopesMatch &&
                includeDashboardIdsMatch &&
                excludeDashboardIdsMatch
            );
        });

        logger.debug({
            message: messageWithContext(`${this.getScopeRows.name} finished with`),
            filteredScopeRows: shortenLoggingArray(filteredScopeRows),
        });

        return filteredScopeRows;
    }

    public subscribeToScopeUpdates(filters: TScopeFilters, traceId: TraceId) {
        return scopeUpdatesTrigger$.pipe(
            switchMap(() => this.getScopeRows(filters, traceId)),
            distinctUntilChanged<TIndexedScopeItem[]>(isEqual),
        );
    }

    public subscribeToScopesUpdatesGroupedById(filters: TScopeFilters, traceId: TraceId) {
        return this.subscribeToScopeUpdates(filters, traceId).pipe(
            map((filteredScopeItems) => {
                const scopesGroupedByIds = groupBy(filteredScopeItems, 'dashboardId');

                const mappedScopesGroupedByIds = mapValues(scopesGroupedByIds, (items) =>
                    items.map((scopeItem) => scopeItem.scope),
                );

                return mappedScopesGroupedByIds;
            }),
        );
    }

    private watchScopeUpdates() {
        scopeUpdatesTrigger$.subscribe((scopeUpdate) => {
            const traceId = generateTraceId();

            this.logger.debug({
                message: messageWithContext('received scope update'),
                scopeUpdate,
                traceId,
            });

            if (isNil(scopeUpdate)) {
                return;
            }

            const { operation } = scopeUpdate;

            switch (operation) {
                case 'INSERT':
                case 'UPDATE': {
                    this.index(omit(scopeUpdate, 'operation'), traceId);
                    break;
                }
                case 'DELETE':
                    this.removeBinding(omit(scopeUpdate, 'operation'), traceId);
                    break;
                default:
                    assertNever(operation);
            }
        });
    }
}

export const scopesIndex = new ScopesIndex();
