import { objectToBase64 } from '@common/utils/src/base64';
import type { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { ETableSearchParams } from '@frontend/common/src/modules/router/defs';
import type { BaseLinkProps } from 'react-router5/dist/BaseLink';

import type { ETableGroupsFilterKeys } from '../components/Tables/TableGroups/def';
import type { ETablePoliciesFilterKeys } from '../components/Tables/TablePolicies/def';
import type { ETableUsersFilterKeys } from '../components/Tables/TableUsers/def';
import type { EDefaultLayoutComponents } from '../layouts/default';
import type { EFilterOptions } from './defaultFilterParams';

export function getTableFilter(
    tab: EDefaultLayoutComponents,
    tableId: ETableIds,
    filterKey: ETableGroupsFilterKeys | ETablePoliciesFilterKeys | ETableUsersFilterKeys,
    type: EFilterOptions,
    filter: string | undefined,
): BaseLinkProps['routeParams'] {
    return {
        tab,
        [ETableSearchParams.TableFilter]: objectToBase64({
            [tableId]: {
                [filterKey]: {
                    filterType: 'text',
                    type,
                    filter,
                },
            },
        }),
    };
}
