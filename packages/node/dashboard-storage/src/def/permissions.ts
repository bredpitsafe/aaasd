import { Permission } from './response.ts';
import { TUserName } from './user.ts';

export type TPermission = {
    dashboardId: string;
    user: TUserName;
    permission: Permission;
    insertionTime: string;
};

export enum EGroups {
    All = '@all',
}
