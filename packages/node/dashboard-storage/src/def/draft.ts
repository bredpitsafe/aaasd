import { TDashboard } from './dashboard.ts';
import { TUserName } from './user.ts';

export type TDashboardDraft = Pick<TDashboard, 'config' | 'digest' | 'insertionTime'> & {
    dashboardId: TDashboard['id'];
    user: TUserName;
};

export type TUpdatableDashboardDraft = Omit<TDashboardDraft, 'insertionTime'>;
export type TDashboardDraftLookup = Pick<TDashboardDraft, 'dashboardId' | 'digest'>;
