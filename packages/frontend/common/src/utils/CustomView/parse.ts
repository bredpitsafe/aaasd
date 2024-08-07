import { assert } from '@common/utils/src/assert.ts';
import { extractValidNumber } from '@common/utils/src/extract.ts';
import type { Properties, StandardProperties } from 'csstype';
import { defaults, isEmpty, isNil, isString } from 'lodash-es';

import type { TSocketURL } from '../../types/domain/sockets';
import { throwingError } from '../throwingError';
import { getStyleFromXmlElement, wrapToArray } from '../xml';
import type { TScheme, TXmlCssProperties, TXmlToJsonScheme, TXmlToJsonSchemeElement } from './defs';
import { CUSTOM_VIEW_VERSION } from './defs';
import type { SyntaxError } from './parsers/custom-view.generated';
import { parse } from './parsers/custom-view.generated';
import type { TCustomViewCompiledGrid, TCustomViewCompiledTable } from './parsers/defs';

export function convertFromXmlJsonScheme(scheme: TXmlToJsonScheme): TScheme | undefined {
    const config = mapXmlSchemeElement(scheme);
    const timeout = extractValidNumber(scheme.timeout);

    if (isNil(config) && isNil(timeout)) {
        return undefined;
    }

    return {
        name: scheme.name,
        config,
        timeout,
        timeoutStyle: scheme.timeoutStyle as unknown as StandardProperties,
    };
}

/*
 * Converts XML data scheme:
 * <table><schemes>
 *   <!-- EnumConverter -->
 *   <scheme name="AxisStatus" extends="EnumConverter">
 *      <element value="0" text="Unknown status: must be a bug" />
 *      <element value="1" text="Axis is ready to trade" />
 *      <element value="2" text="Axis is not trading: market data is empty" />
 *      <element value="null" text="Indicator is null" />
 *      <element text="Indicator was not received from server" />
 *      <element from="35" text="Foo" />
 *      <element from="10" to="35" text="Blah" background="red" />
 *      <element text="Bar" background="#0088ff" />
 *    </scheme>
 *  </schemes>
 * </schemes></table>
 */
function mapXmlSchemeElement(scheme: TXmlToJsonScheme): TScheme['config'] | undefined {
    return wrapToArray(scheme.element)?.map((element: TXmlToJsonSchemeElement) => ({
        value: extractValidNumberOrNull(element.value),
        left: extractValidNumber(element.from) ?? undefined,
        right: extractValidNumber(element.to) ?? undefined,
        text: element.text,
        tooltip: element.tooltip,
        style: getXmlSchemeStyle(element),
    }));
}

function getXmlSchemeStyle(element: TXmlToJsonSchemeElement): Properties {
    return defaults(
        {
            backgroundColor: element.background,
            borderRadius: element.borderRadius,
        },
        getFullStyleFromXmlElement(element),
    );
}

function extractValidNumberOrNull(value?: string | number | null): number | null | undefined {
    if (isString(value) && value.toLowerCase() === 'null') {
        return null;
    }

    return extractValidNumber(value);
}

function getFullStyleFromXmlElement(
    xmlElement: { style?: TXmlCssProperties },
    baseStyle?: Properties,
): Properties | undefined {
    const resultCss = defaults(
        xmlElement?.style as Properties,
        getStyleFromXmlElement(xmlElement, baseStyle),
    );

    return isEmpty(resultCss) ? undefined : resultCss;
}

export function prepareImportableTable(
    table: string,
    defaultUrl?: TSocketURL,
): TCustomViewCompiledTable | undefined {
    const result = prepareImportable(table, defaultUrl);
    if (isNil(result)) {
        return;
    }

    assert(isCustomViewTable(result), 'Parsed configuration is not a custom view table');
    return result;
}

export function prepareImportableGrid(
    grid: string,
    defaultUrl?: TSocketURL,
): TCustomViewCompiledGrid | undefined {
    const result = prepareImportable(grid, defaultUrl);
    if (isNil(result)) {
        return;
    }

    assert(isCustomViewGrid(result), 'Parsed configuration is not a custom view grid');
    return result;
}

export function prepareImportable(
    config: string,
    defaultUrl?: TSocketURL,
): TCustomViewCompiledTable | TCustomViewCompiledGrid | undefined {
    if (isEmpty(defaultUrl) || isEmpty(config)) {
        return undefined;
    }

    try {
        return parse(config.replaceAll(/\u00A0/g, ' '), {
            defaultUrl,
            version: CUSTOM_VIEW_VERSION,
        }) as TCustomViewCompiledTable | TCustomViewCompiledGrid;
    } catch (error) {
        throwingError((error as SyntaxError).message);
    }
}

export function isCustomViewGrid(
    data: TCustomViewCompiledTable | TCustomViewCompiledGrid,
): data is TCustomViewCompiledGrid {
    return data.hasOwnProperty('grid');
}

export function isCustomViewTable(
    data: TCustomViewCompiledTable | TCustomViewCompiledGrid,
): data is TCustomViewCompiledTable {
    return data.hasOwnProperty('table');
}
