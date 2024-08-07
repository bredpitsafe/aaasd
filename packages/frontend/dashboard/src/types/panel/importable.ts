import type { EChartType } from '@frontend/charter/src/components/Chart/defs';
import type { EVirtualViewport } from '@frontend/charter/src/components/Viewport/def';
import type { EFollowMode } from '@frontend/charter/src/plugins/AutoFollowViewport/def';
import type { TXmlToJsonArray } from '@frontend/common/src/types/xml';
import type { TXmlSchemes } from '@frontend/common/src/utils/CustomView/defs';
import type {
    TXmlImportableGrid,
    TXmlImportableTable,
} from '@frontend/common/src/utils/CustomView/parsers/defs';

import type { TImportableGridCell } from '../layout/importable';
import type { EPanelType, EServerTimeUnit } from './common';

export type TImportablePanelWrapped = {
    panel: TImportablePanel;
};

export type TImportablePanel =
    | TImportableChartPanel
    | TImportableCustomViewGridPanel
    | TImportableCustomViewTablePanel;

export type TImportableChartPanel = {
    /** Optional panel id */
    panelId?: string;
    /** Panel type. */
    type?: EPanelType.Charts;
    /** Panel settings */
    settings: TImportablePanelSettings;
    /** Panel position on the grid. */
    layout?: TImportableGridCell;
    /** List of several possible layouts that the user can switch between. */
    layouts?: TImportableLayouts;
    /** Charts configuration. Only applicable if `type` is set to `Charts`. */
    charts?: {
        chart?: TXmlToJsonArray<TImportablePanelChart>;
    };
    /** Schemes for custom data converters. */
    schemes?: TXmlSchemes;
    /** Levels bars to display on top of the chart. Only applicable if `type` is set to `Charts`. */
    levels?: {
        level?: TXmlToJsonArray<TImportablePanelChartLevel>;
    };
};

export type TImportableCustomViewGridPanel = {
    /** Optional panel id */
    panelId?: string;
    /** Panel type. */
    type?: EPanelType.CustomViewGrid;
    /** Panel settings */
    settings: Pick<TImportablePanelSettings, 'url' | 'label'>;
    /** Panel position on the grid. */
    layout?: TImportableGridCell;
    /** List of several possible layouts that the user can switch between. */
    layouts?: TImportableLayouts;
    /** Grid configuration. Only applicable if `type` is set to `CustomViewGrid`. */
    grid?: TXmlImportableGrid;
};

export type TImportableCustomViewTablePanel = {
    /** Optional panel id */
    panelId?: string;
    /** Panel type. */
    type?: EPanelType.CustomViewTable;
    /** Panel settings */
    settings: Pick<TImportablePanelSettings, 'url' | 'label'>;
    /** Panel position on the grid. */
    layout?: TImportableGridCell;
    /** List of several possible layouts that the user can switch between. */
    layouts?: TImportableLayouts;
    /** Table configuration. Only applicable if `type` is set to `CustomViewTable`. */
    table?: TXmlImportableTable;
};

type TImportableLayouts = {
    layout?: TXmlToJsonArray<TImportableLayout>;
};

export type TImportableLayout = TImportableGridCell & {
    name?: string;
};

/** Panel settings */
export type TImportablePanelSettings = {
    /** Socket URL to acquire chart data from. */
    url?: string;

    /** Chart label. Used in the legend. */
    label?: string;

    /** Whether to show chart legends or not. Default: `true`. */
    legends?: boolean;

    /** Limit chart viewport from below for left axis charts.
     * Viewport bottom value can't be lower than this limit.
     * Though, it can be higher if chart values allow it. */
    minY?: number;

    /** Limit chart viewport from above for left axis charts.
     * Viewport top value can't be higher than this limit.
     * Though, it can be lower if chart values allow it. */
    maxY?: number;

    /** Binds viewport from below to a fixed value for left axis charts.
     * Chart values will not alter viewport bottom value. */

    fixedMinY?: number;

    /** Binds viewport from above to a fixed value for left axis charts.
     * Chart values will not alter viewport top value. */
    fixedMaxY?: number;

    /** Limit chart viewport from below for right axis charts.
     * Viewport top value can't be lower than this limit.
     * Though, it can be higher if chart values allow it. */
    minYRight?: number;

    /** Limit chart viewport from above for right axis charts.
     * Viewport top value can't be higher than this limit.
     * Though, it can be lower if chart values allow it. */
    maxYRight?: number;

    /** Binds viewport from below to a fixed value for right axis charts.
     * Chart values will not alter viewport bottom value. */
    fixedMinYRight?: number;

    /** Binds viewport from above to a fixed value for right axis charts.
     * Chart values will not alter viewport top value. */
    fixedMaxYRight?: number;

    /** Maximum zoom level allowed for this charts (in nanoseconds) */
    minWidth?: number;

    /** Minimum zoom level allowed for this charts (in nanoseconds) */
    maxWidth?: number;

    zoomStepMultiplier?: number;

    /** Sets chart viewport to a custom date (in nanoseconds). Default: current date and time. */
    focusTo?: number;
    followMode?: EFollowMode;

    /** Enable or disable chart mouseover tooltip.
     * Default: true */
    closestPoints?: boolean;

    /** Chart offset from local time.
     * Default: 0 - local time */
    serverTimeUnit?: EServerTimeUnit;
    serverTimeIncrement?: number;

    /** Always display '0' mark on the left Y axis. */
    displayZeroLeft?: boolean;

    /** Always display '0' mark on the right Y axis. */
    displayZeroRight?: boolean;

    /** Min zoom limit - minimal time per one pixel */
    minZoom?: number;

    /** Max zoom limit - maximum time per one pixel */
    maxZoom?: number;
};

/** Single chart configuration. */
export type TImportablePanelChart = {
    /** Chart ID. Generated automatically. */
    id?: string | number;

    /** Query to backend for loading chart data.
     * Example: `indicators{name='put.indicator.name.here'}` */
    query: string;

    /** Specific url for data */
    url?: string;

    /** Chart label for legend and mouseover tooltip. */
    label?: string;

    /** Custom label format using `sprintf` syntax.
     * You can set both label (1st placeholder) and value (2nd placeholder).
     * Example: `%s: %.6g` */
    labelFormat?: string;

    /** Whether to display legend for this chart. */
    legend?: boolean;

    /** Chart type. */
    type?: EChartType;

    /** Chart width (in px).
     * Default: 1px. */
    width?: number;

    /** Chart color (HEX).
     * Example: `#ff00ff` */
    color?: string | number;

    /** Chart opacity [0..1]. */
    opacity?: number;

    /** Point size (in px).
     * Only applicable for charts with `type="points"`. */
    pointSize?: number;
    striving?: boolean;
    fixedZoom?: number;

    /** Whether to display chart. */
    visible?: boolean;

    /** Custom formula for modifying original data value. */
    formula?: string;

    /** Custom function for modifying original point style properties.
     * Example: `function (style, data) { style.width = 10; style.color = 0xff00ee; style.opacity = 0.8; }` */
    styler?: string;

    /** Whether to bind chart to the left or right Y axis.
     * Default: `left` */
    yAxis?: EVirtualViewport;

    /** Group charts by assigning a same group label (any string).
     * Charts with the same group can toggle their visibility with a single click on the legend. */
    group?: string | number;

    styleConverter?: string;
    styleIndicator?: string;
};

type TImportablePanelChartLevelBase = {
    /** Level line color */
    color?: string;
    /** Level line opacity. Must be in range [0,1]. */
    opacity?: number;
    /** Axis to apply level to. */
    yAxis?: EVirtualViewport;
};

/** Defines chart level in a form of a line. */
type TImportablePanelChartLevelLine = TImportablePanelChartLevelBase & {
    /** Line level on Y axis. */
    value: number;
    /** Line width in px. Default: 1. */
    width?: number;
};

type TImportablePanelChartLevelFilledArea = TImportablePanelChartLevelBase & {
    top: number;
    bottom: number;
};

type TImportablePanelChartLevel =
    | TImportablePanelChartLevelLine
    | TImportablePanelChartLevelFilledArea;
