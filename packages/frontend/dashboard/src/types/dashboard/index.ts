import type { TStorageDashboardName } from '@frontend/common/src/types/domain/dashboardsStorage';
import type { TSemverVersion } from '@frontend/common/src/utils/Semver/def';

import type { TGridSettings } from '../layout';
import type { TPanel } from '../panel';

export type TDashboard = {
    version?: TSemverVersion;
    activeLayout: undefined | string;
    name: TStorageDashboardName;
    grid: TGridSettings;
    panels: TPanel[];
};
