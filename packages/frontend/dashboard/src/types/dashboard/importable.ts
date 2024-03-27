import type { TXmlToJsonArray } from '@frontend/common/src/types/xml';

import type { TImportableGridSettings } from '../layout/importable';
import type { TImportablePanel } from '../panel/importable';

export type TImportableDashboard = {
    /** Configuration root */
    dashboard: {
        /** Dashboard version. */
        version: undefined | string;
        /** Dashboard name. Must be unique among your dashboards. */
        name?: string;
        /** Grid configuration, such as number of rows and columns. */
        grid?: Partial<TImportableGridSettings>;
        activeLayout?: string;
        /** List of dashboard panels. */
        panels?: {
            panel?: TXmlToJsonArray<TImportablePanel>;
        };
    };
};
