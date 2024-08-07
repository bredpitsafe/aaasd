import type { TPolicy } from '@backend/bff/src/modules/authorization/schemas/SubscribeToPolicySnapshot.schema';
import type { ColDef, ICellRendererParams } from '@frontend/ag-grid';
import { withReadOnlyEditor } from '@frontend/common/src/components/AgTable/editors/ReadOnlyEditor';
import { Link } from '@frontend/common/src/components/Link';
import { useModule } from '@frontend/common/src/di/react';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { ModuleRouter } from '@frontend/common/src/modules/router';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isNil } from 'lodash-es';

import { EDefaultLayoutComponents } from '../../../layouts/default';
import { EAuthzRoutes } from '../../../modules/router/def';
import { EFilterOptions } from '../../../utils/defaultFilterParams';
import { getLinkParams } from '../../../utils/getLinkParams';
import { getTableFilter } from '../../../utils/getTableFilter';
import { ETableGroupsFilterKeys } from '../TableGroups/def';
import { ETablePoliciesFilterKeys } from '../TablePolicies/def';
import { cnLinkWithEllipsis } from '../tables.css';
import type { TTableUsersGroup } from './def';

export const usersTableGroupColumns: ColDef<TTableUsersGroup>[] = [
    {
        field: 'name',
        headerName: 'Name',
        sort: 'asc',
        cellDataType: 'object',
        useValueFormatterForExport: true,
        valueFormatter: (params) => JSON.stringify(params.value),
        cellRenderer: (params: ICellRendererParams<TTableUsersGroup>) => {
            const { state$ } = useModule(ModuleRouter);
            const routeState = useSyncObservable(state$);

            const group = params.node.data as TTableUsersGroup;

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

            const routeParams = getLinkParams(linkParams, routeState.route?.params);

            return (
                <Link
                    routeName={EAuthzRoutes.Auth}
                    className={cnLinkWithEllipsis}
                    routeParams={routeParams}
                >
                    {group.name}
                </Link>
            );
        },
    },
    {
        field: 'description',
        headerName: 'Description',
        filter: false,
        suppressAutoSize: true,
        tooltipField: 'description',
        ...withReadOnlyEditor(),
    },
];

export const usersTablePolicyColumns: ColDef<TPolicy>[] = [
    {
        field: 'templateName',
        headerName: 'Name',
        sort: 'asc',
        cellDataType: 'object',
        useValueFormatterForExport: true,
        valueFormatter: (params) => JSON.stringify(params.value),
        cellRenderer: (params: ICellRendererParams<TTableUsersGroup>) => {
            const { state$ } = useModule(ModuleRouter);
            const routeState = useSyncObservable(state$);

            const policy = params.node.data as TPolicy;

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

            const routeParams = getLinkParams(linkParams, routeState.route?.params);

            return (
                <Link
                    className={cnLinkWithEllipsis}
                    routeName={EAuthzRoutes.Auth}
                    routeParams={routeParams}
                >
                    {policy.templateName}
                </Link>
            );
        },
    },
    {
        field: 'description',
        headerName: 'Description',
        filter: false,
        suppressAutoSize: true,
        tooltipField: 'description',
        ...withReadOnlyEditor(),
    },
];
