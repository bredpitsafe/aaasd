import { XMLBuilder } from 'fast-xml-parser';
import { isNil } from 'lodash-es';

const STRING_PREFIX = '(string)';

export function jsonToXml(json: unknown): string {
    if (isNil(json)) {
        return '';
    }

    return new XMLBuilder({
        format: true,
        processEntities: false,
        commentPropName: 'comment',
        // @ts-ignore - incorrect types inside XMLBuilder
        tagValueProcessor: buildTagValue,
    }).build(json);
}

function buildTagValue(tag: string, value: string | number | boolean): string | number | boolean {
    if (typeof value === 'string' && value !== '' && !isNaN(Number(value))) {
        return `${STRING_PREFIX}${value}`;
    }

    return value;
}

export function parseTagValue(tag: string, value: string): string | number | boolean {
    // Strict type cast ("(string)22" == "22")
    if (value.startsWith(STRING_PREFIX)) {
        return value.substring(STRING_PREFIX.length);
    }

    if (tag === 'color') {
        // dashboard.panels.panel.charts.chart.color
        // dashboard.panels.panel.table.body.row.column.color
        // dashboard.panels.panel.table.row.column.color
        return value;
    }

    if (tag === 'formula') {
        // dashboard.panels.panel.formula
        return value;
    }

    // Case then string is boolean
    if (value === 'true') return true;
    if (value === 'false') return false;

    // Case then string is number ("1e-13" == 1e-13 / "2.0" == 2)
    if (!isNaN(Number(value))) {
        return Number(value);
    }

    return value;
}
