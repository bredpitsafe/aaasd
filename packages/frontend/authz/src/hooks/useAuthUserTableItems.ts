import type { TUserFilter } from '@backend/bff/src/modules/authorization/schemas/SubscribeToUserSnapshot.schema';
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
import { compact, omit } from 'lodash-es';
import { useMemo } from 'react';
import { combineLatest } from 'rxjs';

import type { TTableUsersItem } from '../components/Tables/TableUsers/def';
import { ModuleSubscribeToGroupsSnapshot } from '../modules/actions/ModuleSubscribeToGroupsSnapshot';
import { ModuleSubscribeToPoliciesSnapshot } from '../modules/actions/ModuleSubscribeToPoliciesSnapshot';
import { getIndirectGroups } from '../utils/getIndirectGroups';

export function useAuthUserTableItems(
    options: TWithTraceId,
    filters?: TUserFilter,
): TComponentValueDescriptor<TTableUsersItem[]> {
    const subToUsers = useModule(ModuleSubscribeToUserSnapshot);
    const subToGroups = useModule(ModuleSubscribeToGroupsSnapshot);
    const subToPolicies = useModule(ModuleSubscribeToPoliciesSnapshot);

    const items$ = useMemo(() => {
        return combineLatest([
            subToUsers({ filters: filters ?? {} }, options),
            subToGroups({ filters: {} }, options).pipe(
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
            mapValueDescriptor(({ value: [users, groupsMap, policiesMap] }) => {
                return createSyncedValueDescriptor(
                    users.map((user): TTableUsersItem => {
                        const userPolicies = compact(
                            user.policies.map((policy) => policiesMap.get(policy)),
                        );
                        return {
                            user: {
                                ...omit(user, 'groups', 'description', 'policies'),
                                policies: userPolicies,
                            },
                            policies: userPolicies,
                            directGroups: compact(
                                user.groups.map((group) => groupsMap.get(group)),
                            ).map((group) => ({
                                name: group.name,
                                description: group.description,
                            })),
                            indirectGroups: getIndirectGroups(user.groups, groupsMap),
                        };
                    }),
                );
            }),
        );
    }, [filters]);

    return useNotifiedValueDescriptorObservable(items$);
}
