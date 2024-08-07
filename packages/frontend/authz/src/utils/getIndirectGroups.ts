import type { TGroup } from '@backend/bff/src/modules/authorization/schemas/SubscribeToGroupSnapshot.schema';
import { compact, isNil } from 'lodash-es';

import type { TTableUsersGroup } from '../components/Tables/TableUsers/def';

export function getIndirectGroups(
    directGroups: string[],
    groupsMap: Map<string, TGroup>,
): TTableUsersGroup[] {
    const indirectGroups = new Set<string>();

    function getParentGroups(groupName: string) {
        if (isNil(groupsMap.get(groupName))) return;

        for (const groupValue of groupsMap.values()) {
            if (
                groupValue?.groupMembers.includes(groupName) &&
                !directGroups.includes(groupValue.name)
            ) {
                indirectGroups.add(groupValue.name);
                getParentGroups(groupValue.name);
            }
        }
    }

    for (const group of directGroups) {
        getParentGroups(group);
    }

    return compact(
        Array.from(indirectGroups).map((group) => {
            const groupData = groupsMap.get(group);
            if (isNil(groupData)) return;
            return { name: groupData.name, description: groupData.description };
        }),
    );
}
