import type { Someseconds } from '@common/types';
import { assertNever } from '@common/utils/src/assert.ts';
import { extractValidEnum, extractValidNumber } from '@common/utils/src/extract.ts';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import type {
    TXmlImportableGrid,
    TXmlImportableTable,
} from '@frontend/common/src/utils/CustomView/parsers/defs';
import { deepMapKeys } from '@frontend/common/src/utils/deepMapKeys';
import { wrapToArray, wrapToElement } from '@frontend/common/src/utils/xml';
import { XMLBuilder, XMLParser, XMLValidator } from 'fast-xml-parser';
import { camelCase, isEmpty, isNil, omit, snakeCase } from 'lodash-es';

import type { TGridCell } from '../../types/layout';
import type {
    TPanel,
    TPanelContent,
    TPanelId,
    TPanelSettings,
    TPanelXMLConfigWithoutLayout,
} from '../../types/panel';
import { EPanelType, EServerTimeUnit } from '../../types/panel';
import type {
    TExportablePanelWrappedConfig,
    TExportablePanelWrappedEditor,
    TExportablePanelWrappedEditorSimplified,
} from '../../types/panel/exportable';
import {
    isChartPanel,
    isCustomViewGridPanel,
    isCustomViewTablePanel,
    isImportableChartPanel,
    isImportableCustomViewGridPanel,
    isImportableCustomViewTablePanel,
} from '../../types/panel/guards';
import type {
    TImportableLayout,
    TImportablePanel,
    TImportablePanelChart,
    TImportablePanelSettings,
    TImportablePanelWrapped,
} from '../../types/panel/importable';
import { prepareChartToExport, prepareImportableChart } from '../dashboards/converters';
import { parseTagValue } from '../xml';
import { ConvertError } from './errors';
import { createPanelId, getPanelIdFromMarkerComment } from './index';

export async function convertXMLToPanel(
    config: TPanelXMLConfigWithoutLayout,
): Promise<TPanelContent> {
    const isValidXML = XMLValidator.validate(config);

    if (isValidXML === true) {
        const json = deepMapKeys<TImportablePanelWrapped>(
            new XMLParser({
                trimValues: true,
                numberParseOptions: {
                    hex: true,
                    leadingZeros: false,
                },
                // @ts-ignore - incorrect return type inside XMLParser
                tagValueProcessor: parseTagValue,
            }).parse(config),
            camelCase,
        );

        if (isNil(json.panel)) {
            throw new Error(`XML doesn't contain panel tag`);
        }

        const fixedJson: TImportablePanelWrapped = {
            panel: fixNonCriticalPanelIssues(json.panel),
        };

        const Ajv = (await import('ajv')).default;
        const ajv = new Ajv({
            allErrors: true,
            allowUnionTypes: true,
        });
        const schemaPanelXML = await import('../../schemas/generated/PanelXML.json');

        const validate = ajv.compile<TImportablePanelWrapped>(schemaPanelXML);
        const isValidJSON = validate(fixedJson);

        if (isValidJSON !== true) {
            throw new ConvertError(`Incorrect Panel XML`, validate.errors);
        }

        return convertImportableXmlPanelToPanel(fixedJson.panel);
    } else {
        throw new ConvertError('Fail on parse Panel XML', JSON.stringify(isValidXML.err, null, 2));
    }
}

export function fixNonCriticalPanelIssues(jsonPanel: TImportablePanel): TImportablePanel {
    const common = {
        panelId: isNil(jsonPanel.panelId)
            ? createPanelId()
            : (getPanelIdFromMarkerComment(jsonPanel.panelId) as TPanelId),
        settings: jsonPanel.settings,
        layouts: {
            layout: fixNonCriticalPanelLayoutIssues(
                wrapToElement(jsonPanel.layout),
                wrapToArray(jsonPanel.layouts?.layout),
            ),
        },
    };

    if (isImportableChartPanel(jsonPanel)) {
        const charts = wrapToArray(jsonPanel.charts?.chart)?.map(fixNonCriticalChartIssues);
        const schemes = wrapToArray(jsonPanel.schemes?.scheme);
        const levels = wrapToArray(jsonPanel.levels?.level);

        return {
            ...common,
            type: EPanelType.Charts,
            charts: isNil(charts) ? undefined : { chart: charts },
            schemes: isNil(schemes) ? undefined : { scheme: schemes },
            levels: isNil(levels) ? undefined : { level: levels },
        };
    }

    if (isImportableCustomViewGridPanel(jsonPanel)) {
        return {
            ...common,
            type: EPanelType.CustomViewGrid,
            grid: jsonPanel.grid,
        };
    }

    if (isImportableCustomViewTablePanel(jsonPanel)) {
        return {
            ...common,
            type: EPanelType.CustomViewTable,
            table: fixImportableTable(jsonPanel.table),
        };
    }

    assertNever(jsonPanel);
}

function fixImportableTable(
    jsonTable: TXmlImportableTable | undefined,
): TXmlImportableTable | undefined {
    if (isEmpty(jsonTable) || isEmpty(jsonTable.header) || isEmpty(jsonTable.header?.column)) {
        return jsonTable;
    }

    return {
        ...omit(jsonTable, ['layout', 'style']),
        header: {
            ...jsonTable.header,
            column: (wrapToArray(jsonTable.header?.column) ?? []).map((column) => {
                if (isNil(column) || isNil(column.width)) {
                    return column;
                }

                return {
                    ...column,
                    width: extractValidNumber(parseFloat(String(column.width))),
                };
            }),
        },
    };
}

function fixNonCriticalChartIssues(jsonChart: TImportablePanelChart): TImportablePanelChart {
    return {
        ...jsonChart,
        formula: isJsonEmpty(jsonChart.formula) ? undefined : jsonChart.formula.toString(),
        labelFormat: isJsonEmpty(jsonChart.labelFormat)
            ? undefined
            : jsonChart.labelFormat.toString(),
        label: isJsonEmpty(jsonChart.label) ? undefined : jsonChart.label.toString(),
        group: isJsonEmpty(jsonChart.group) ? undefined : jsonChart.group.toString(),
        opacity: isJsonEmpty(jsonChart.opacity) ? undefined : jsonChart.opacity,
        width: isJsonEmpty(jsonChart.width) ? undefined : jsonChart.width,
    };
}

function isJsonEmpty(jsonValue: string | number | undefined): jsonValue is undefined | '' {
    return isNil(jsonValue) || jsonValue === '';
}

function fixNonCriticalPanelLayoutIssues(
    layout: undefined | TGridCell,
    layouts: undefined | TImportableLayout[],
): TImportableLayout[] {
    if (isNil(layout) && isNil(layouts)) {
        return [];
    }

    if (!isNil(layouts)) {
        return layouts;
    }

    if (!isNil(layout)) {
        return [layout];
    }

    return [];
}

export function fixDuplicatePanelIds(panels: TImportablePanel[]): TImportablePanel[] {
    const panelIds = new Set<TPanelId>();

    return panels.map((panel) => {
        let panelId = panel.panelId as TPanelId;
        if (panelIds.has(panelId)) {
            panelId = createPanelId();
            panelIds.add(panelId);
            return {
                ...panel,
                panelId,
            };
        }
        panelIds.add(panel.panelId as TPanelId);
        return panel;
    });
}

export function convertImportableXmlPanelToPanel(
    panel: TImportablePanel,
    additionalSettings?: Partial<TPanelSettings>,
): TPanelContent {
    const settings = prepareImportablePanelSettings(panel.settings, additionalSettings);

    if (isImportableChartPanel(panel)) {
        const xmlCharts = wrapToArray(panel.charts?.chart) ?? [];

        return {
            type: EPanelType.Charts,
            settings,
            charts: xmlCharts.map(prepareImportableChart),
            levels: wrapToArray(panel.levels?.level),
            schemes: wrapToArray(panel.schemes?.scheme),
        };
    }

    if (isImportableCustomViewGridPanel(panel)) {
        return {
            type: EPanelType.CustomViewGrid,
            settings,
            grid: panel.grid,
        };
    }

    if (isImportableCustomViewTablePanel(panel)) {
        return {
            type: EPanelType.CustomViewTable,
            settings,
            table: panel.table,
        };
    }

    assertNever(panel);
}

export function convertPanelToEditConfigPanelXml(
    panel: TExportablePanelWrappedEditor | TExportablePanelWrappedEditorSimplified,
): string {
    const exportablePanel = deepMapKeys(panel, snakeCase);

    return new XMLBuilder({
        format: true,
        processEntities: false,
    }).build(exportablePanel);
}

export function convertPanelTableConfigToXml(config: TXmlImportableTable): string {
    const exportableConfig = deepMapKeys(config, snakeCase);

    return new XMLBuilder({
        format: true,
        processEntities: false,
    }).build({ table: exportableConfig });
}

export function convertPanelGridConfigToXml(config: TXmlImportableGrid): string {
    const exportableConfig = deepMapKeys(config, snakeCase);

    return new XMLBuilder({
        format: true,
        processEntities: false,
    }).build({ grid: exportableConfig });
}

export function convertPanelToExportablePanelEditorSimplified(
    panel: TPanel,
): TExportablePanelWrappedEditorSimplified {
    const exportablePanel = convertPanelToExportablePanelConfig(panel).panel;

    return {
        panel: omit(exportablePanel, 'panelId', 'layouts'),
    };
}

export function convertPanelToExportablePanelEditor(panel: TPanel): TExportablePanelWrappedEditor {
    const exportablePanel = convertPanelToExportablePanelConfig(panel).panel;

    return {
        panel: omit(exportablePanel, 'panelId'),
    };
}

export function convertPanelToExportablePanelConfig(panel: TPanel): TExportablePanelWrappedConfig {
    const common = {
        panelId: panel.panelId,
        layouts: { layout: panel.layouts },
        settings: panel.settings,
    };

    if (isChartPanel(panel)) {
        return {
            panel: {
                ...common,
                type: EPanelType.Charts,
                schemes: isEmpty(panel.schemes) ? undefined : { scheme: panel.schemes },
                charts: {
                    chart: panel.charts?.map(prepareChartToExport) ?? [],
                },
                levels: isEmpty(panel.levels)
                    ? undefined
                    : {
                          level: panel.levels,
                      },
            },
        };
    }

    if (isCustomViewTablePanel(panel)) {
        return {
            panel: {
                ...common,
                type: EPanelType.CustomViewTable,
                table: panel.table,
            },
        };
    }

    if (isCustomViewGridPanel(panel)) {
        return {
            panel: {
                ...common,
                type: EPanelType.CustomViewGrid,
                grid: panel.grid,
            },
        };
    }

    assertNever(panel);
}

function prepareImportablePanelSettings(
    json?: TImportablePanelSettings,
    additionalSettings?: Partial<TPanelSettings>,
): TPanelSettings {
    const url = (json?.url ?? additionalSettings?.url) as undefined | TSocketURL;

    if (isNil(url)) {
        throw new ConvertError('All Panels settings must have url');
    }

    const serverTimeUnit = extractValidEnum<EServerTimeUnit>(json?.serverTimeUnit, EServerTimeUnit);

    const hiddenSettings: {} = {
        doNotInitializeCharts: (json as { doNotInitializeCharts?: boolean }).doNotInitializeCharts,
    };

    return {
        ...additionalSettings,

        url,
        serverTimeUnit,
        label: json?.label,
        legends: json?.legends,
        minY: json?.minY,
        maxY: json?.maxY,
        fixedMinY: json?.fixedMinY,
        fixedMaxY: json?.fixedMaxY,
        minYRight: json?.minYRight,
        maxYRight: json?.maxYRight,
        fixedMinYRight: json?.fixedMinYRight,
        fixedMaxYRight: json?.fixedMaxYRight,
        minWidth: json?.minWidth as Someseconds | undefined,
        maxWidth: json?.maxWidth as Someseconds | undefined,
        zoomStepMultiplier: json?.zoomStepMultiplier,
        focusTo: json?.focusTo as Someseconds | undefined,
        followMode: json?.followMode,
        closestPoints: json?.closestPoints,
        serverTimeIncrement: json?.serverTimeIncrement as Someseconds | undefined,
        displayZeroLeft: json?.displayZeroLeft,
        displayZeroRight: json?.displayZeroRight,
        minZoom: json?.minZoom,
        maxZoom: json?.maxZoom,

        ...hiddenSettings,
    };
}
