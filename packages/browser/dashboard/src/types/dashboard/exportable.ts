import type { TExportableGridSettings } from '../layout/exportable';
import type { TExportablePanel } from '../panel/exportable';

export type TExportableDashboardEditorWrapped = {
    dashboard: TExportableDashboardEditor;
};

export type TExportableDashboardWrapped = {
    dashboard: TExportableDashboard;
};

type TExportableDashboardEditor = {
    version?: string;
    activeLayout?: string;
    name: string;
    grid: TExportableGridSettings;
    panels: {
        panel: (Omit<TExportablePanel, 'panelId'> & { comment: string })[];
    };
};

/** @public */
export type TExportableDashboard = {
    version?: string;
    activeLayout?: string;
    name: string;
    grid: TExportableGridSettings;
    panels: {
        panel: TExportablePanel[];
    };
};
