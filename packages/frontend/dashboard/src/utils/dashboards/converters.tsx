import { extractValidEnum } from '@common/utils/src/extract.ts';
import { EChartType } from '@frontend/charter/src/components/Chart/defs';
import { EVirtualViewport } from '@frontend/charter/src/components/ChartViewport/defs';
import type {
    TStorageDashboardConfig,
    TStorageDashboardName,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { getFormattedColor } from '@frontend/common/src/utils/colors';
import { deepMapKeys } from '@frontend/common/src/utils/deepMapKeys';
import type { TPromqlQuery } from '@frontend/common/src/utils/Promql';
import { validateNumberConversionFnBody } from '@frontend/common/src/utils/Sandboxes/numberConversion';
import { validatePointStylerFnBody } from '@frontend/common/src/utils/Sandboxes/pointStyler';
import { extractValidSemverVersion } from '@frontend/common/src/utils/Semver';
import { throwingError } from '@frontend/common/src/utils/throwingError';
import { getValidSocketUrl } from '@frontend/common/src/utils/url';
import { wrapToArray } from '@frontend/common/src/utils/xml';
import type { ErrorObject } from 'ajv';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { camelCase, isEmpty, isNil, isString, isUndefined, omit, snakeCase } from 'lodash-es';

import type { TDashboard } from '../../types/dashboard';
import type {
    TExportableDashboardEditorWrapped,
    TExportableDashboardFileWrapped,
    TExportableDashboardWrapped,
} from '../../types/dashboard/exportable';
import type { TImportableDashboard } from '../../types/dashboard/importable';
import type { TGridSettings } from '../../types/layout';
import type { TChartPanelChartProps, TPanel, TPanelId, TPanelSettings } from '../../types/panel';
import type { TExportablePanel, TExportablePanelChart } from '../../types/panel/exportable';
import type { TImportablePanelChart } from '../../types/panel/importable';
import {
    createDefaultGridCellSize,
    createGridLayoutNxM,
    createGridSettingsByImportableSettings,
} from '../layout';
import {
    createChartPanelChartProps,
    createPanelId,
    getGridCellPositionByIndex,
    getPanelIdMarkerComment,
} from '../panels';
import {
    convertImportableXmlPanelToPanel,
    convertPanelToExportablePanelConfig,
    convertPanelToExportablePanelEditor,
    fixDuplicatePanelIds,
    fixNonCriticalPanelIssues,
} from '../panels/converters';
import { jsonToXml, parseTagValue } from '../xml';
import { createConvertError } from './errors';
import { addMissingPanelLayouts, CURRENT_DASHBOARD_VERSION } from './index';

function parseXMLToImportableDashboard(config: string): TImportableDashboard {
    return deepMapKeys<TImportableDashboard>(
        new XMLParser({
            trimValues: true,
            numberParseOptions: {
                hex: true,
                leadingZeros: false,
            },
            // @ts-ignore - incorrect return type inside XMLParser
            tagValueProcessor: parseTagValue,
            commentPropName: 'panelId',
        }).parse(config),
        camelCase,
    );
}

export async function validateFullDashboardJsonStructure(
    json: TImportableDashboard,
): Promise<true | ErrorObject[]> {
    const Ajv = (await import('ajv')).default;
    const ajv = new Ajv({
        allErrors: true,
        allowUnionTypes: true,
    });

    const schemaDashboardXML = await import('../../schemas/generated/DashboardXML.json');

    const validate = ajv.compile<TImportableDashboard>(schemaDashboardXML);

    return validate(json) === true || validate.errors!;
}

export async function convertXMLToDashboard(config: TStorageDashboardConfig): Promise<TDashboard> {
    const isValidXML = XMLValidator.validate(config);

    if (isValidXML === true) {
        const json = parseXMLToImportableDashboard(config);
        return convertImportableJsonToDashboard(fixNonCriticalDashboardsIssues(json));
    } else {
        throw createConvertError(
            'Fail on parse Dashboard XML',
            JSON.stringify(isValidXML.err, null, 2),
        );
    }
}

function fixNonCriticalDashboardsIssues(jsonDashboard: TImportableDashboard): TImportableDashboard {
    if (isEmpty(jsonDashboard.dashboard)) {
        throw new Error(`XML doesn't contain dashboard tag`);
    }

    const panels = wrapToArray(jsonDashboard.dashboard.panels?.panel);

    return {
        dashboard: {
            ...jsonDashboard.dashboard,
            panels: isNil(panels)
                ? undefined
                : {
                      panel: fixDuplicatePanelIds(panels.map(fixNonCriticalPanelIssues)),
                  },
        },
    };
}

export async function convertImportableJsonToDashboard(
    json: TImportableDashboard,
    additionalSettings?: Partial<TPanelSettings>,
): Promise<TDashboard> {
    const validationResult = await validateFullDashboardJsonStructure(json);

    if (validationResult !== true) {
        const message = `Incorrect Dashboard XML`;
        throw createConvertError(message, validationResult);
    }

    return convertImportableXmlDashboardToDashboard(
        fixNonCriticalDashboardsIssues(json),
        additionalSettings,
    );
}

export function convertImportableXmlDashboardToDashboard(
    json: TImportableDashboard,
    additionalSettings?: Partial<TPanelSettings>,
): TDashboard {
    const xmlPanels = wrapToArray(json.dashboard.panels?.panel) ?? [];

    const groundGridSettings = createGridSettingsByImportableSettings(json.dashboard.grid);

    const defaultLayout = createGridLayoutNxM(
        json.dashboard.grid?.colsCount ?? 2,
        json.dashboard.grid?.rowsCount ?? 2,
    );

    const defaultCell: TGridSettings['panel'] = {
        ...createDefaultGridCellSize(defaultLayout.colsCount, defaultLayout.rowsCount),
        relMinWidth: groundGridSettings.panel.relMinWidth,
        relMinHeight: groundGridSettings.panel.relMinHeight,
    };

    const panels: TPanel[] = xmlPanels.map((importablePanel, index): TPanel => {
        const layouts = wrapToArray(importablePanel?.layouts?.layout);

        return {
            ...convertImportableXmlPanelToPanel(importablePanel, additionalSettings),
            panelId: (importablePanel.panelId as TPanelId | undefined) ?? createPanelId(),
            layouts:
                layouts === undefined || layouts.length === 0
                    ? [
                          {
                              ...defaultCell,
                              ...getGridCellPositionByIndex(defaultLayout, index),
                          },
                      ]
                    : layouts,
        };
    });

    const dashboardName = json.dashboard?.name
        ? String(json.dashboard?.name)
        : `Dashboard ${new Date().toISOString()}`;

    return {
        version: extractValidSemverVersion(json.dashboard.version) ?? CURRENT_DASHBOARD_VERSION,
        activeLayout: json.dashboard.activeLayout,
        name: dashboardName as TStorageDashboardName,
        grid: groundGridSettings,
        panels: addMissingPanelLayouts(json.dashboard.activeLayout, panels, groundGridSettings),
    };
}

export function convertDashboardToXml(
    exportableDashboard:
        | TExportableDashboardWrapped
        | TExportableDashboardEditorWrapped
        | TExportableDashboardFileWrapped,
): TStorageDashboardConfig {
    const dashboardXML = deepMapKeys(exportableDashboard, snakeCase);

    return jsonToXml(dashboardXML) as TStorageDashboardConfig;
}

export function convertDashboardToExportableDashboardConfig(
    dashboard: TDashboard,
): TExportableDashboardWrapped {
    return {
        dashboard: {
            version: dashboard.version,
            name: dashboard.name,
            activeLayout: dashboard.activeLayout,
            grid: dashboard.grid,
            panels: {
                panel: dashboard.panels.map(
                    (panel): TExportablePanel => convertPanelToExportablePanelConfig(panel).panel,
                ),
            },
        },
    };
}

export function convertDashboardToExportableDashboardEditor(
    dashboard: TDashboard,
): TExportableDashboardEditorWrapped {
    return {
        dashboard: {
            version: dashboard.version,
            name: dashboard.name,
            activeLayout: dashboard.activeLayout,
            grid: dashboard.grid,
            panels: {
                panel: dashboard.panels.map((panel) => ({
                    comment: getPanelIdMarkerComment(panel.panelId),
                    ...convertPanelToExportablePanelEditor(panel).panel,
                })),
            },
        },
    };
}

export function prepareImportableChart(
    json: TImportablePanelChart,
    index: number,
): TChartPanelChartProps {
    const query =
        json.query !== undefined
            ? (json.query.trim() as TPromqlQuery)
            : throwingError(new Error('Panel Chart invalid query'));
    const type = extractValidEnum<EChartType>(json.type, EChartType);
    const yAxis = extractValidEnum<EVirtualViewport>(json.yAxis, EVirtualViewport);
    const color = getFormattedColor(json.color);

    const formula = isUndefined(json.formula)
        ? undefined
        : isString(json.formula) && validateNumberConversionFnBody(json.formula)
          ? json.formula.trim()
          : throwingError(`Panel Chart invalid formula "${json.formula}"`);
    const styler =
        isUndefined(json.styler) ||
        (isString(json.styler) && validatePointStylerFnBody(json.styler))
            ? json.styler?.trim()
            : throwingError(`Panel Chart invalid styler "${json.styler}"`);

    // ID should be uniq
    const url = isNil(json.url) ? undefined : getValidSocketUrl(json.url as TSocketURL);

    return createChartPanelChartProps(
        {
            ...json,
            url,
            query,
            type,
            color,
            yAxis,
            formula,
            styler,
            styleConverter: json.styleConverter,
            styleIndicator: json.styleIndicator,
        },
        index,
    );
}

export function prepareChartToExport(chart: TChartPanelChartProps): TExportablePanelChart {
    return {
        ...omit(chart, 'id'),
        color: getFormattedColor(chart.color),
    };
}
