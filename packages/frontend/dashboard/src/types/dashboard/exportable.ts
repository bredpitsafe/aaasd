import type { TExportableGridSettings } from '../layout/exportable';
import type { TExportablePanel } from '../panel/exportable';

export type TExportableDashboardEditorWrapped = {
    dashboard: TExportableDashboardEditor;
};

export type TExportableDashboardWrapped = {
    dashboard: TExportableDashboard;
};

export type TExportableDashboardFileWrapped = {
    dashboard: TExportableDashboardFile;
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

type TExportableDashboardFile = {
    version?: string;
    activeLayout?: string;
    name: string;
    grid: TExportableGridSettings;
    panels: {
        panel: Omit<TExportablePanel, 'panelId'>[];
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
