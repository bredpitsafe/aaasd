import { keyExists } from '../utils';
import type {
    TImportableChartPanel,
    TImportableCustomViewGridPanel,
    TImportableCustomViewTablePanel,
    TImportablePanel,
} from './importable';
import type { TChartPanel, TCustomViewGridPanel, TCustomViewTablePanel, TPanel } from './index';
import { EPanelType } from './index';

export function isChartPanel(panel: TPanel): panel is TChartPanel {
    return panel.type === EPanelType.Charts;
}

export function isCustomViewGridPanel(panel: TPanel): panel is TCustomViewGridPanel {
    return panel.type === EPanelType.CustomViewGrid;
}

export function isCustomViewTablePanel(panel: TPanel): panel is TCustomViewTablePanel {
    return panel.type === EPanelType.CustomViewTable;
}

export function isImportableChartPanel(panel: TImportablePanel): panel is TImportableChartPanel {
    return (
        panel.type === EPanelType.Charts ||
        keyExists<TImportableChartPanel>(panel, 'charts') ||
        (!keyExists<TImportableCustomViewGridPanel>(panel, 'grid') &&
            !keyExists<TImportableCustomViewTablePanel>(panel, 'table'))
    );
}

export function isImportableCustomViewGridPanel(
    panel: TImportablePanel,
): panel is TImportableCustomViewGridPanel {
    return (
        panel.type === EPanelType.CustomViewGrid ||
        keyExists<TImportableCustomViewGridPanel>(panel, 'grid')
    );
}

export function isImportableCustomViewTablePanel(
    panel: TImportablePanel,
): panel is TImportableCustomViewTablePanel {
    return (
        panel.type === EPanelType.CustomViewTable ||
        keyExists<TImportableCustomViewTablePanel>(panel, 'table')
    );
}
