import type { EChartType } from '@frontend/charter/src/components/Chart/defs';
import type { EVirtualViewport } from '@frontend/charter/src/components/ChartViewport/defs';
import type { EFollowMode } from '@frontend/charter/src/plugins/AutoFollowViewport/def';
import type { TXmlSchemes } from '@frontend/common/src/utils/CustomView/defs';
import type {
    TXmlImportableGrid,
    TXmlImportableTable,
} from '@frontend/common/src/utils/CustomView/parsers/defs';

import type { TExportableGridCell } from '../layout/exportable';
import type { EPanelType, EServerTimeUnit, TChartPanelLevelProps } from './index';

export type TExportablePanelWrappedEditor = {
    panel: Omit<TExportablePanel, 'panelId'>;
};

export type TExportablePanelWrappedEditorSimplified = {
    panel: Omit<TExportablePanel, 'panelId' | 'layouts'>;
};

export type TExportablePanelWrappedConfig = {
    panel: TExportablePanel;
};

export type TExportablePanel =
    | TExportableChartPanel
    | TExportableCustomViewGridPanel
    | TExportableCustomViewTablePanel;

type TExportableChartPanel = {
    panelId: string;
    type: EPanelType.Charts;
    settings: TExportablePanelSettings;
    layouts: TExportableLayouts;
    charts: {
        chart: TExportablePanelChart[];
    };
    schemes?: TXmlSchemes;
    levels?: {
        level?: TChartPanelLevelProps[];
    };
};

type TExportableCustomViewGridPanel = {
    panelId: string;
    type: EPanelType.CustomViewGrid;
    settings: Pick<TExportablePanelSettings, 'url' | 'label'>;
    layouts: TExportableLayouts;
    grid?: TXmlImportableGrid;
};

type TExportableCustomViewTablePanel = {
    panelId: string;
    type: EPanelType.CustomViewTable;
    settings: Pick<TExportablePanelSettings, 'url' | 'label'>;
    layouts: TExportableLayouts;
    table?: TXmlImportableTable;
};

type TExportablePanelSettings = {
    url?: string;
    label?: string;
    legends?: boolean;
    minY?: number;
    maxY?: number;
    fixedMinY?: number;
    fixedMaxY?: number;
    minYRight?: number;
    maxYRight?: number;
    fixedMinYRight?: number;
    fixedMaxYRight?: number;
    minWidth?: number;
    maxWidth?: number;
    zoomStepMultiplier?: number;
    focusTo?: number;
    followMode?: EFollowMode;
    closestPoints?: boolean;
    serverTimeUnit?: EServerTimeUnit;
    serverTimeIncrement?: number;
    displayZeroLeft?: boolean;
    displayZeroRight?: boolean;
    minZoom?: number;
    maxZoom?: number;
};

export type TExportablePanelChart = {
    query: string;
    url?: string;
    label?: string;
    labelFormat?: string;
    legend?: boolean;
    type?: EChartType;
    width?: number;
    color?: string | number;
    opacity?: number;
    pointSize?: number;
    striving?: boolean;
    fixedZoom?: number;
    visible?: boolean;
    formula?: string;
    yAxis?: EVirtualViewport;
    group?: string | number;
    styleConverter?: string;
    styleIndicator?: string;
    backgroundIndicator?: string;
    backgroundConverter?: string;
};

type TExportableLayouts = {
    layout: TExportableLayout[];
};

type TExportableLayout = TExportableGridCell & {
    name?: string;
};
