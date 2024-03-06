import type { TExportableDashboard } from '../types/dashboard/exportable';
import type { TImportableDashboard } from '../types/dashboard/importable';
import type { TExportablePanel } from '../types/panel/exportable';
import type { TImportablePanelWrapped } from '../types/panel/importable';

export type Panel = TExportablePanel;
export type PanelXML = TImportablePanelWrapped;
export type Dashboard = TExportableDashboard;
export type DashboardXML = TImportableDashboard;
