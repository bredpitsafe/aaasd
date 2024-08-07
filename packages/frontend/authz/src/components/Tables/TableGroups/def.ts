import type { TGroup } from '@backend/bff/src/modules/authorization/schemas/SubscribeToGroupSnapshot.schema';
import type { TPolicy } from '@backend/bff/src/modules/authorization/schemas/SubscribeToPolicySnapshot.schema';
import type { TUser } from '@backend/bff/src/modules/authorization/schemas/SubscribeToUserSnapshot.schema';

export type TTableGroupsItem = {
    group: TGroup;
    childGroups: TGroup[];
    usersDirect: TUser[];
    usersIndirect: TUser[];
    policies: TPolicy[];
};

export enum ETableGroupsFilterKeys {
    Group = 'group',
    User = 'usersDirect',
}
