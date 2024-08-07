import type { TUserName } from '@common/types/src/primitives/index.ts';

import type { TDbDashboard } from './dashboard.ts';

export type TDbDashboardDraft = Pick<TDbDashboard, 'config' | 'digest' | 'insertionTime'> & {
    dashboardId: TDbDashboard['id'];
    user: TUserName;
};

export type TUpdatableDbDashboardDraft = Omit<TDbDashboardDraft, 'insertionTime'>;
export type TDashboardDraftLookup = Pick<TDbDashboardDraft, 'dashboardId' | 'digest'>;
