import type { TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import type { TParseCSVOptions } from '@frontend/common/src/components/TableLabel/TableLabelExportData';
import type { FieldInfo } from 'json2csv';
import { capitalize, isNumber, lowerCase } from 'lodash-es';

import type { THerodotusTaskView } from '../types';

export async function getExportCSVOptions(
    timeZone: TimeZone,
): Promise<TParseCSVOptions<THerodotusTaskView>> {
    const {
        transforms: { unwind },
    } = await import('json2csv');

    const fields: (string | FieldInfo<THerodotusTaskView>)[] = [
        getFieldInfo('taskId'),
        getFieldInfo('robotId'),
        getFieldInfo('status'),
        getFieldInfo('taskType'),
        getFieldInfo('progress'),
        getFieldInfo('asset'),
        getFieldInfo('amount'),
        getFieldInfo(`sellVolume`),
        getFieldInfo(`buyVolume`),
        getFieldInfo('avgPrice'),
        getFieldInfo('realizedPremium'),
        getFieldInfo('aggression'),
        getFieldInfo('orderSize'),
        getFieldInfo('priceLimit'),
        getFieldInfo('maxPremium'),
        {
            label: 'Started',
            value: (row: THerodotusTaskView) =>
                toDayjsWithTimezone(row.createdTs, timeZone).format(
                    EDateTimeFormats.DateTimeMilliseconds,
                ),
        },
        {
            label: 'Updated',
            value: (row: THerodotusTaskView) =>
                toDayjsWithTimezone(row.lastChangedTs, timeZone).format(
                    EDateTimeFormats.DateTimeMilliseconds,
                ),
        },
        {
            label: 'Finished',
            value: (row: THerodotusTaskView) =>
                isNumber(row.finishedTs) && isFinite(row.finishedTs)
                    ? toDayjsWithTimezone(row.finishedTs, timeZone).format(
                          EDateTimeFormats.DateTimeMilliseconds,
                      )
                    : null,
        },

        ...getInstrumentsFields('buyInstruments'),
        ...getInstrumentsFields('sellInstruments'),
        getFieldInfo('user'),
    ];

    return {
        fields,
        transforms: [
            unwind({
                paths: ['buyInstruments', 'sellInstruments'],
                blankOut: true,
            }),
        ],
    };

    function getFieldInfo(key: keyof THerodotusTaskView, label?: string): FieldInfo<unknown> {
        return {
            label: label ?? capitalize(lowerCase(key)),
            value: key,
        };
    }

    function getInstrumentsFields(
        key: 'buyInstruments' | 'sellInstruments',
    ): FieldInfo<THerodotusTaskView>[] {
        const name = capitalize(lowerCase(key));
        return [
            {
                label: `${name} - Side`,
                value: `${key}.type`,
            },
            {
                label: `${name} - Name`,
                value: `${key}.fullName`,
            },
            {
                label: `${name} - Amount`,
                value: `${key}.filledAmountBase`,
            },
            {
                label: `${name} - Target`,
                value: `${key}.targetPrice`,
            },
            {
                label: `${name} - Order`,
                value: `${key}.orderPrice`,
            },
            {
                label: `${name} - Average`,
                value: `${key}.averagePrice`,
            },
            {
                label: `${name} - Avg. Price $`,
                value: `${key}.averagePriceUsd`,
            },
            {
                label: `${name} - Volume`,
                value: `${key}.volume`,
            },
        ];
    }
}
