import type { TGroup } from '@backend/bff/src/modules/authorization/schemas/SubscribeToGroupSnapshot.schema.ts';
import type { TPolicy } from '@backend/bff/src/modules/authorization/schemas/SubscribeToPolicySnapshot.schema.ts';
import type { TUser } from '@backend/bff/src/modules/authorization/schemas/SubscribeToUserSnapshot.schema.ts';
import type { ColDef, ICellRendererParams, RowHeightParams } from '@frontend/ag-grid';
import { lowerCaseOrNilComparator } from '@frontend/ag-grid/src/comparators/lowerCaseOrNilComparator.ts';
import { FLOATING_TEXT_FILTER } from '@frontend/ag-grid/src/filters.ts';
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
import { getLinkParams } from '../../../utils/getLinkParams.ts';
import { getTableFilter } from '../../../utils/getTableFilter.ts';
import {
    DEFAULT_LI_HEIGHT,
    DEFAULT_MINIMIZE_LENGTH,
    ListOfElements,
} from '../../ListOfElements/view.tsx';
import { ETablePoliciesFilterKeys } from '../TablePolicies/def.ts';
import { cnLinkWithEllipsis } from '../tables.css.ts';
import type { TTableGroupsItem } from './def.ts';
import {
    groupsTableGroupColumns,
    groupsTablePolicyColumns,
    groupsTableUserColumns,
} from './innerColumns.tsx';

export function getRowHeight(params: RowHeightParams<TTableGroupsItem>): number {
    let policiesLength = params.data?.group.policies.length ?? 0;
    let indirectGroupsLength = params.data?.group.groupMembers.length ?? 0;
    let userDirectLength = params.data?.usersDirect.length ?? 0;
    let userIndirectLength = params.data?.usersIndirect.length ?? 0;

    if (policiesLength > DEFAULT_MINIMIZE_LENGTH) {
        policiesLength = 1;
    }

    if (indirectGroupsLength > DEFAULT_MINIMIZE_LENGTH) {
        indirectGroupsLength = 1;
    }

    if (userDirectLength > DEFAULT_MINIMIZE_LENGTH) {
        userDirectLength = 1;
    }

    if (userIndirectLength > DEFAULT_MINIMIZE_LENGTH) {
        userIndirectLength = 1;
    }

    const maxLength = Math.max(policiesLength, userDirectLength, indirectGroupsLength) || 1;
    return maxLength * DEFAULT_LI_HEIGHT;
}

export function useColumns() {
    return useMemo<ColDef<TTableGroupsItem>[]>(() => {
        return [
            {
                colId: 'group',
                field: 'group',
                headerName: 'Group',
                sort: 'asc',
                comparator: (a: TTableGroupsItem['group'], b: TTableGroupsItem['group']) =>
                    lowerCaseOrNilComparator(a?.name, b?.name),
                cellDataType: 'object',
                useValueFormatterForExport: true,
                valueFormatter: (params) => params.value.name,
                ...FLOATING_TEXT_FILTER,
                filterParams: {
                    textFormatter: (v: string | TGroup) => {
                        if (typeof v === 'string') {
                            return v;
                        }
                        return v.name;
                    },
                },
                equals: (a?: TTableGroupsItem['group'], b?: TTableGroupsItem['group']) =>
                    a?.name === b?.name && a?.description === b?.description,
                cellRenderer: (
                    params: ICellRendererParams<TTableGroupsItem['group'], TTableGroupsItem>,
                ) => {
                    const { state$ } = useModule(ModuleRouter);
                    const routeState = useSyncObservable(state$);

                    if (isNil(routeState)) {
                        return params.value?.name;
                    }

                    const linkParams = getTableFilter(
                        EDefaultLayoutComponents.Policies,
                        ETableIds.AuthzPolicies,
                        ETablePoliciesFilterKeys.Groups,
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
                colId: 'childGroups',
                field: 'childGroups',
                headerName: 'Child Groups',
                cellDataType: 'object',
                useValueFormatterForExport: true,
                valueFormatter: (params) =>
                    JSON.stringify(params.value.map(({ name }: { name: string }) => name)),
                sortable: false,
                ...FLOATING_TEXT_FILTER,
                filterParams: {
                    textFormatter: (v: string | TGroup[]) => {
                        if (typeof v === 'string') {
                            return v;
                        }
                        return v.map(({ name }) => name).join(',');
                    },
                    filterOptions: ARRAY_FILTER_OPTIONS,
                },
                equals: isEqual,
                cellRenderer: (params: ICellRendererParams<TTableGroupsItem['childGroups']>) => {
                    const { state$ } = useModule(ModuleRouter);
                    const routeState = useSyncObservable(state$);

                    return (
                        <ListOfElements<TGroup>
                            rowKey="name"
                            data={params?.value || []}
                            columns={groupsTableGroupColumns}
                        >
                            {params.value &&
                                params.value?.map((group) => {
                                    if (isNil(routeState)) {
                                        return group.name || '';
                                    }

                                    const linkParams = getTableFilter(
                                        EDefaultLayoutComponents.Policies,
                                        ETableIds.AuthzPolicies,
                                        ETablePoliciesFilterKeys.Groups,
                                        EFilterOptions.Contains,
                                        group?.name,
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
                colId: 'usersDirect',
                field: 'usersDirect',
                headerName: 'Direct Users',
                sort: 'asc',
                sortable: false,
                cellDataType: 'object',
                useValueFormatterForExport: true,
                valueFormatter: (params) =>
                    JSON.stringify(params.value.map(({ name }: { name: string }) => name)),
                ...FLOATING_TEXT_FILTER,
                filterParams: {
                    textFormatter: (v: string | TUser[]) => {
                        if (typeof v === 'string') {
                            return v;
                        }
                        return v.map(({ name, displayName }) => `${name},${displayName}`).join(',');
                    },
                    filterOptions: ARRAY_FILTER_OPTIONS,
                },
                equals: isEqual,
                cellRenderer: (params: ICellRendererParams<TTableGroupsItem['usersDirect']>) => {
                    const { state$ } = useModule(ModuleRouter);
                    const routeState = useSyncObservable(state$);

                    return (
                        <ListOfElements<TUser>
                            rowKey="name"
                            data={params?.value || []}
                            columns={groupsTableUserColumns}
                        >
                            {params.value &&
                                params.value?.map((user) => {
                                    if (isNil(routeState)) {
                                        return user.displayName
                                            ? `${user.displayName} (${user.name})`
                                            : user.name;
                                    }

                                    const linkParams = getTableFilter(
                                        EDefaultLayoutComponents.Policies,
                                        ETableIds.AuthzPolicies,
                                        ETablePoliciesFilterKeys.Users,
                                        EFilterOptions.Contains,
                                        user.name,
                                    );

                                    const routeParams = getLinkParams(
                                        linkParams,
                                        routeState.route?.params,
                                    );

                                    return (
                                        <Link
                                            key={user.name}
                                            className={cnLinkWithEllipsis}
                                            routeName={EAuthzRoutes.Auth}
                                            routeParams={routeParams}
                                        >
                                            {user.displayName
                                                ? `${user.displayName} (${user.name})`
                                                : user.name}
                                        </Link>
                                    );
                                })}
                        </ListOfElements>
                    );
                },
            },
            {
                colId: 'usersIndirect',
                field: 'usersIndirect',
                headerName: 'Indirect Users',
                sortable: false,
                cellDataType: 'object',
                useValueFormatterForExport: true,
                valueFormatter: (params) =>
                    JSON.stringify(params.value.map(({ name }: { name: string }) => name)),
                ...FLOATING_TEXT_FILTER,
                filterParams: {
                    textFormatter: (v: string | TUser[]) => {
                        if (typeof v === 'string') {
                            return v;
                        }
                        return v.map(({ name, displayName }) => `${name},${displayName}`).join(',');
                    },
                    filterOptions: ARRAY_FILTER_OPTIONS,
                },
                equals: isEqual,
                cellRenderer: (params: ICellRendererParams<TTableGroupsItem['usersIndirect']>) => {
                    const { state$ } = useModule(ModuleRouter);
                    const routeState = useSyncObservable(state$);

                    return (
                        <ListOfElements<TUser>
                            rowKey="name"
                            data={params?.value || []}
                            columns={groupsTableUserColumns}
                        >
                            {params.value &&
                                params.value?.map((user) => {
                                    if (isNil(routeState)) {
                                        return user.displayName
                                            ? `${user.displayName} (${user.name})`
                                            : user.name;
                                    }

                                    const linkParams = getTableFilter(
                                        EDefaultLayoutComponents.Policies,
                                        ETableIds.AuthzPolicies,
                                        ETablePoliciesFilterKeys.Users,
                                        EFilterOptions.Contains,
                                        user.name,
                                    );

                                    const routeParams = getLinkParams(
                                        linkParams,
                                        routeState.route?.params,
                                    );

                                    return (
                                        <Link
                                            key={user.name}
                                            className={cnLinkWithEllipsis}
                                            routeName={EAuthzRoutes.Auth}
                                            routeParams={routeParams}
                                        >
                                            {user.displayName
                                                ? `${user.displayName} (${user.name})`
                                                : user.name}
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
                cellRenderer: (params: ICellRendererParams<TTableGroupsItem['policies']>) => {
                    const { state$ } = useModule(ModuleRouter);
                    const routeState = useSyncObservable(state$);

                    return (
                        <ListOfElements<TPolicy>
                            rowKey="id"
                            data={params?.value || []}
                            columns={groupsTablePolicyColumns}
                        >
                            {params.value &&
                                params.value?.map((policy) => {
                                    if (isNil(routeState)) {
                                        return policy.templateName;
                                    }

                                    const linkParams = getTableFilter(
                                        EDefaultLayoutComponents.Policies,
                                        ETableIds.AuthzPolicies,
                                        ETablePoliciesFilterKeys.Templates,
                                        EFilterOptions.Contains,
                                        policy.templateName,
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
