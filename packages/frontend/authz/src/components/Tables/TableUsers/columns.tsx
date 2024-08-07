import type { TPolicy } from '@backend/bff/src/modules/authorization/schemas/SubscribeToPolicySnapshot.schema.ts';
import type { TUser } from '@backend/bff/src/modules/authorization/schemas/SubscribeToUserSnapshot.schema.ts';
import type { ColDef, ICellRendererParams, RowHeightParams } from '@frontend/ag-grid';
import { lowerCaseOrNilComparator } from '@frontend/ag-grid/src/comparators/lowerCaseOrNilComparator.ts';
import { FLOATING_TEXT_FILTER } from '@frontend/ag-grid/src/filters';
import { Link } from '@frontend/common/src/components/Link';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data.ts';
import { ModuleRouter } from '@frontend/common/src/modules/router/index.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import { isEqual, isNil } from 'lodash-es';
import { useMemo } from 'react';

import { EDefaultLayoutComponents } from '../../../layouts/default.tsx';
import { EAuthzRoutes } from '../../../modules/router/def.ts';
import { ARRAY_FILTER_OPTIONS, EFilterOptions } from '../../../utils/defaultFilterParams.ts';
import { getLinkParams } from '../../../utils/getLinkParams';
import { getTableFilter } from '../../../utils/getTableFilter.ts';
import {
    DEFAULT_LI_HEIGHT,
    DEFAULT_MINIMIZE_LENGTH,
    ListOfElements,
} from '../../ListOfElements/view.tsx';
import { ETableGroupsFilterKeys } from '../TableGroups/def.ts';
import { ETablePoliciesFilterKeys } from '../TablePolicies/def.ts';
import { cnLinkWithEllipsis } from '../tables.css.ts';
import type { TTableUsersGroup, TTableUsersItem } from './def.ts';
import { usersTableGroupColumns, usersTablePolicyColumns } from './innerColumns.tsx';

export function getRowHeight(params: RowHeightParams<TTableUsersItem>): number {
    let policiesLength = params.data?.policies.length ?? 0;
    let directGroupsLength = params.data?.directGroups.length ?? 0;
    let indirectGroupsLength = params.data?.indirectGroups.length ?? 0;

    if (policiesLength > DEFAULT_MINIMIZE_LENGTH) {
        policiesLength = 1;
    }
    if (directGroupsLength > DEFAULT_MINIMIZE_LENGTH) {
        directGroupsLength = 1;
    }
    if (indirectGroupsLength > DEFAULT_MINIMIZE_LENGTH) {
        indirectGroupsLength = 1;
    }

    const maxLength = Math.max(policiesLength, directGroupsLength, indirectGroupsLength) || 1;
    return maxLength * DEFAULT_LI_HEIGHT;
}

export function useColumns() {
    return useMemo<ColDef<TTableUsersItem>[]>(() => {
        return [
            {
                colId: 'user',
                field: 'user',
                headerName: 'Login',
                sort: 'asc',
                comparator: (a: TTableUsersItem['user'], b: TTableUsersItem['user']) =>
                    lowerCaseOrNilComparator(a?.name, b?.name),
                cellDataType: 'object',
                useValueFormatterForExport: true,
                valueFormatter: (params) => params.value.name,
                ...FLOATING_TEXT_FILTER,
                filterParams: {
                    textFormatter: (v: string | TUser) => {
                        if (typeof v === 'string') {
                            return v;
                        }
                        return v.name;
                    },
                },
                equals: (a?: TTableUsersItem['user'], b?: TTableUsersItem['user']) =>
                    a?.name === b?.name && a?.email === b?.email,
                cellRenderer: (
                    params: ICellRendererParams<TTableUsersItem['user'], TTableUsersItem>,
                ) => {
                    const { state$ } = useModule(ModuleRouter);
                    const routeState = useSyncObservable(state$);

                    if (isNil(routeState)) {
                        return params.value?.name || '';
                    }

                    const linkParams = getTableFilter(
                        EDefaultLayoutComponents.Policies,
                        ETableIds.AuthzPolicies,
                        ETablePoliciesFilterKeys.Users,
                        EFilterOptions.Contains,
                        params.value?.name,
                    );

                    const routeParams = getLinkParams(linkParams, routeState.route?.params);

                    return (
                        <Link
                            className={cnLinkWithEllipsis}
                            routeName={EAuthzRoutes.Auth}
                            routeParams={routeParams}
                        >
                            {params.value?.name}
                        </Link>
                    );
                },
            },
            {
                colId: 'user.displayName',
                field: 'user.displayName',
                headerName: 'Name',
                sort: 'asc',
                comparator: lowerCaseOrNilComparator,
                ...FLOATING_TEXT_FILTER,
            },
            {
                colId: 'directGroups',
                field: 'directGroups',
                headerName: 'Direct Groups',
                cellDataType: 'object',
                useValueFormatterForExport: true,
                valueFormatter: (params) =>
                    JSON.stringify(params.value.map(({ name }: { name: string }) => name)),
                sortable: false,
                ...FLOATING_TEXT_FILTER,
                filterParams: {
                    textFormatter: (v: string | TTableUsersGroup[]) => {
                        if (typeof v === 'string') {
                            return v;
                        }
                        return v.map(({ name }) => name).join(',');
                    },
                    filterOptions: ARRAY_FILTER_OPTIONS,
                },
                equals: isEqual,
                cellRenderer: (params: ICellRendererParams<TTableUsersItem['directGroups']>) => {
                    const { state$ } = useModule(ModuleRouter);
                    const routeState = useSyncObservable(state$);

                    return (
                        <ListOfElements<TTableUsersGroup>
                            rowKey="name"
                            data={params?.value || []}
                            columns={usersTableGroupColumns}
                        >
                            {params.value &&
                                params.value?.map((group) => {
                                    if (isNil(routeState)) {
                                        return group.name;
                                    }
                                    const linkParams = getTableFilter(
                                        EDefaultLayoutComponents.Groups,
                                        ETableIds.AuthzGroups,
                                        ETableGroupsFilterKeys.Group,
                                        EFilterOptions.Contains,
                                        group.name,
                                    );

                                    const routeParams = getLinkParams(
                                        linkParams,
                                        routeState.route?.params,
                                    );

                                    return (
                                        <Link
                                            key={group.name}
                                            className={cnLinkWithEllipsis}
                                            routeName={EAuthzRoutes.Auth}
                                            routeParams={routeParams}
                                        >
                                            {group.name}
                                        </Link>
                                    );
                                })}
                        </ListOfElements>
                    );
                },
            },
            {
                colId: 'indirectGroups',
                field: 'indirectGroups',
                headerName: 'Indirect Groups',
                sortable: false,
                cellDataType: 'object',
                useValueFormatterForExport: true,
                valueFormatter: (params) =>
                    JSON.stringify(params.value.map(({ name }: { name: string }) => name)),
                ...FLOATING_TEXT_FILTER,
                filterParams: {
                    textFormatter: (v: string | TTableUsersGroup[]) => {
                        if (typeof v === 'string') {
                            return v;
                        }
                        return v.map(({ name }) => name).join(',');
                    },
                    filterOptions: ARRAY_FILTER_OPTIONS,
                },
                equals: isEqual,
                cellRenderer: (params: ICellRendererParams<TTableUsersItem['directGroups']>) => {
                    const { state$ } = useModule(ModuleRouter);
                    const routeState = useSyncObservable(state$);

                    return (
                        <ListOfElements<TTableUsersGroup>
                            rowKey="name"
                            data={params?.value || []}
                            columns={usersTableGroupColumns}
                        >
                            {params.value &&
                                params.value?.map((group) => {
                                    if (isNil(routeState)) {
                                        return group.name;
                                    }
                                    const linkParams = getTableFilter(
                                        EDefaultLayoutComponents.Groups,
                                        ETableIds.AuthzGroups,
                                        ETableGroupsFilterKeys.Group,
                                        EFilterOptions.Contains,
                                        group.name,
                                    );

                                    const routeParams = getLinkParams(
                                        linkParams,
                                        routeState.route?.params,
                                    );

                                    return (
                                        <Link
                                            key={group.name}
                                            className={cnLinkWithEllipsis}
                                            routeName={EAuthzRoutes.Auth}
                                            routeParams={routeParams}
                                        >
                                            {group.name}
                                        </Link>
                                    );
                                })}
                        </ListOfElements>
                    );
                },
            },
            {
                colId: 'policies',
                field: 'policies',
                headerName: 'Policies',
                cellDataType: 'object',
                useValueFormatterForExport: true,
                valueFormatter: (params) =>
                    JSON.stringify(
                        params.value.map(
                            ({ templateName }: { templateName: string }) => templateName,
                        ),
                    ),
                sortable: false,
                ...FLOATING_TEXT_FILTER,
                filterParams: {
                    textFormatter: (v: string | TPolicy[]) => {
                        if (typeof v === 'string') {
                            return v;
                        }
                        return v.map(({ templateName }) => templateName).join(',');
                    },
                    filterOptions: ARRAY_FILTER_OPTIONS,
                },
                equals: isEqual,
                cellRenderer: (params: ICellRendererParams<TTableUsersItem['policies']>) => {
                    const { state$ } = useModule(ModuleRouter);
                    const routeState = useSyncObservable(state$);

                    return (
                        <ListOfElements<TPolicy>
                            rowKey="id"
                            data={params?.value || []}
                            columns={usersTablePolicyColumns}
                        >
                            {params.value &&
                                params.value?.map((policy) => {
                                    if (isNil(routeState)) {
                                        return policy.templateName || '';
                                    }
                                    const linkParams = getTableFilter(
                                        EDefaultLayoutComponents.Policies,
                                        ETableIds.AuthzPolicies,
                                        ETablePoliciesFilterKeys.Templates,
                                        EFilterOptions.Contains,
                                        policy.templateName ?? '',
                                    );

                                    const routeParams = getLinkParams(
                                        linkParams,
                                        routeState.route?.params,
                                    );

                                    return (
                                        <Link
                                            key={policy.id}
                                            className={cnLinkWithEllipsis}
                                            routeName={EAuthzRoutes.Auth}
                                            routeParams={routeParams}
                                        >
                                            {policy.templateName}
                                        </Link>
                                    );
                                })}
                        </ListOfElements>
                    );
                },
            },
        ];
    }, []);
}
