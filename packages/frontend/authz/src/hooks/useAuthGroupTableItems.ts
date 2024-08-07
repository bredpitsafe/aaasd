import type { TGroupFilter } from '@backend/bff/src/modules/authorization/schemas/SubscribeToGroupSnapshot.schema';
import { useModule } from '@frontend/common/src/di/react';
import type { TWithTraceId } from '@frontend/common/src/modules/actions/def';
import { ModuleSubscribeToUserSnapshot } from '@frontend/common/src/modules/authorization/ModuleSubscribeToUserSnapshot.ts';
import type { TComponentValueDescriptor } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import {
    mapValueDescriptor,
    squashValueDescriptors,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { compact, flatten, uniq } from 'lodash-es';
import { useMemo } from 'react';
import { combineLatest } from 'rxjs';

import type { TTableGroupsItem } from '../components/Tables/TableGroups/def';
import { ModuleSubscribeToGroupsSnapshot } from '../modules/actions/ModuleSubscribeToGroupsSnapshot';
import { ModuleSubscribeToPoliciesSnapshot } from '../modules/actions/ModuleSubscribeToPoliciesSnapshot';
import { getIndirectGroups } from '../utils/getIndirectGroups';

export function useAuthGroupTableItems(
    options: TWithTraceId,
    filters?: TGroupFilter,
): TComponentValueDescriptor<TTableGroupsItem[]> {
    const subToUsers = useModule(ModuleSubscribeToUserSnapshot);
    const subToGroups = useModule(ModuleSubscribeToGroupsSnapshot);
    const subToPolicies = useModule(ModuleSubscribeToPoliciesSnapshot);

    const items$ = useMemo(() => {
        return combineLatest([
            subToGroups({ filters: filters ?? {} }, options).pipe(
                mapValueDescriptor(({ value }) => {
                    return createSyncedValueDescriptor({
                        groups: value,
                        groupsMap: new Map(value.map((item) => [item.name, item])),
                    });
                }),
            ),
            subToUsers({ filters: {} }, options).pipe(
                mapValueDescriptor(({ value }) => {
                    return createSyncedValueDescriptor(
                        new Map(value.map((item) => [item.name, item])),
                    );
                }),
            ),
            subToPolicies({ filters: {} }, options).pipe(
                mapValueDescriptor(({ value }) => {
                    return createSyncedValueDescriptor(
                        new Map(value.map((item) => [item.id, item])),
                    );
                }),
            ),
        ]).pipe(
            squashValueDescriptors(),
            mapValueDescriptor(({ value: [groupsMap, users, policiesMap] }) => {
                return createSyncedValueDescriptor(
                    groupsMap.groups.map((group): TTableGroupsItem => {
                        const childGroups = compact(
                            group.groupMembers.map((g) => groupsMap.groupsMap.get(g)),
                        );

                        return {
                            group,
                            childGroups,
                            usersDirect: compact(group.userMembers.map((u) => users.get(u))).sort(
                                (a, b) => a.name.localeCompare(b.name),
                            ),

                            usersIndirect: compact(
                                uniq([
                                    ...flatten(
                                        getIndirectGroups([group.name], groupsMap.groupsMap).map(
                                            (group) =>
                                                groupsMap.groupsMap.get(group.name)?.userMembers ??
                                                [],
                                        ),
                                    ),
                                    ...group.userMembers,
                                ])
                                    .sort((a, b) => a.localeCompare(b))
                                    .map((userName) => (userName ? users.get(userName) : null)),
                            ),
                            policies: compact(
                                group.policies.map((policy) => policiesMap.get(policy)),
                            ),
                        };
                    }),
                );
            }),
        );
    }, [filters]);

    return useNotifiedValueDescriptorObservable(items$);
}
