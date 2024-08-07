import type { TGroup } from '@backend/bff/src/modules/authorization/schemas/SubscribeToGroupSnapshot.schema';
import type { TPolicy } from '@backend/bff/src/modules/authorization/schemas/SubscribeToPolicySnapshot.schema';
import type { TUser } from '@backend/bff/src/modules/authorization/schemas/SubscribeToUserSnapshot.schema';

export type TTableUsersGroup = Pick<TGroup, 'name' | 'description'>;

export type TTableUsersItem = {
    user: Omit<TUser, 'groups' | 'description' | 'policies'> & { policies: TPolicy[] };
    policies: TPolicy[];
    directGroups: TTableUsersGroup[];
    indirectGroups: TTableUsersGroup[];
};

export enum ETableUsersFilterKeys {
    User = 'user',
    Groups = 'directGroups',
}
