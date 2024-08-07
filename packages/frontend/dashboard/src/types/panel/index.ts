import type { Opaque, Someseconds } from '@common/types';
import type { TSeriesId } from '@frontend/charter/lib/Parts/def';
import type { EChartType } from '@frontend/charter/src/components/Chart/defs';
import type { EVirtualViewport } from '@frontend/charter/src/components/ChartViewport/defs';
import type { EFollowMode } from '@frontend/charter/src/plugins/AutoFollowViewport/def';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import type { TXmlToJsonScheme } from '@frontend/common/src/utils/CustomView/defs';
import type {
    TXmlImportableGrid,
    TXmlImportableTable,
} from '@frontend/common/src/utils/CustomView/parsers/defs';
import type { TPromqlQuery } from '@frontend/common/src/utils/Promql';

import type { TGridCell } from '../layout';
import type { EPanelType, EServerTimeUnit } from './common';

export * from './common';

export type TPanelXMLConfigWithoutLayout = Opaque<'Panel Storage Config Without Layout', string>;

export type TPanelId = Opaque<'Panel ID', string>;
export type TPanel = TChartPanel | TCustomViewTablePanel | TCustomViewGridPanel;
export type TPanelContent =
    | Omit<TChartPanel, 'layouts' | 'panelId'>
    | Omit<TCustomViewTablePanel, 'layouts' | 'panelId'>
    | Omit<TCustomViewGridPanel, 'layouts' | 'panelId'>;

export type TBasePanel = {
    readonly panelId: TPanelId;
    layouts: TPanelLayout[];
    settings: TPanelSettings;
};

export type TChartPanel = TBasePanel & {
    type: EPanelType.Charts;
    charts: TChartPanelChartProps[];
    levels?: TChartPanelLevelProps[];
    schemes?: TXmlToJsonScheme[];
};

export type TCustomViewTablePanel = TBasePanel & {
    type: EPanelType.CustomViewTable;
    table?: TXmlImportableTable;
};

export type TCustomViewGridPanel = TBasePanel & {
    type: EPanelType.CustomViewGrid;
    grid?: TXmlImportableGrid;
};

export type TPanelLayout = TGridCell & {
    name?: string;
};

export type TPanelGridCell = TGridCell & {
    panelId: TPanelId;
};

type TPanelChartLevelBase = {
    color?: string;
    opacity?: number;
    yAxis?: EVirtualViewport;
};

type TPanelChartLevelLine = TPanelChartLevelBase & {
    value: number;
    width?: number;
};

type TPanelChartLevelFilledArea = TPanelChartLevelBase & {
    top: number;
    bottom: number;
};

export type TChartPanelLevelProps = TPanelChartLevelLine | TPanelChartLevelFilledArea;

export type TPanelSettings = {
    url: TSocketURL;
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
    minWidth?: Someseconds;
    maxWidth?: Someseconds;
    zoomStepMultiplier?: number;
    focusTo?: Someseconds;
    followMode?: EFollowMode;
    closestPoints?: boolean;
    serverTimeUnit?: EServerTimeUnit;
    serverTimeIncrement?: Someseconds;
    displayZeroLeft?: boolean;
    displayZeroRight?: boolean;
    minZoom?: number;
    maxZoom?: number;
};

export type TChartPanelChartProps = {
    id: TSeriesId;
    query: TPromqlQuery;
    url?: TSocketURL;
    label?: string;
    labelFormat?: string;
    legend?: boolean;
    type?: EChartType;
    color?: string | number;
    opacity?: number;
    width?: number;
    pointSize?: number;
    striving?: boolean;
    fixedZoom?: number;
    visible?: boolean;
    formula?: string;
    styler?: string;
    yAxis?: EVirtualViewport;
    group?: string | number;
    styleConverter?: string;
    styleIndicator?: string;
};
