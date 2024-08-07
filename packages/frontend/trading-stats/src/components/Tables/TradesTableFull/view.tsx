import type { ISO, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { parseToDayjsInTimeZone, toDayjsWithTimezone } from '@common/utils';
import type { RowClassParams, RowClassRules } from '@frontend/ag-grid';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync';
import { useFilteredData } from '@frontend/common/src/components/AgTable/hooks/useFilteredData';
import { useFilterModel } from '@frontend/common/src/components/AgTable/hooks/useFiltereModel';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi';
import { useInfinityDataSource } from '@frontend/common/src/components/AgTable/hooks/useInfinityDataSource';
import { useRowSelection } from '@frontend/common/src/components/AgTable/hooks/useRowSelection';
import { useScrollCallbacks } from '@frontend/common/src/components/AgTable/hooks/useScrollCallbacks';
import { TableLabelLastUpdate } from '@frontend/common/src/components/TableLabel/LastUpdate';
import { TableLabelExportData } from '@frontend/common/src/components/TableLabel/TableLabelExportData';
import { TableLabelFiller } from '@frontend/common/src/components/TableLabel/TableLabelFiller';
import { TableLabelRangeFilter } from '@frontend/common/src/components/TableLabel/TableLabelRangeFilter';
import { TableLabels } from '@frontend/common/src/components/TableLabel/TableLabels';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { EOrderSide } from '@frontend/common/src/types/domain/orders';
import type { TOwnTrade, TOwnTradeFilter } from '@frontend/common/src/types/domain/ownTrades';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { assign, capitalize, isNil, lowerCase } from 'lodash-es';
import type { ReactElement } from 'react';
import { useEffect, useMemo, useRef } from 'react';

import { getColumns } from './columns';
import type { TTradesTableFullProps } from './defs';
import { cnAskRow, cnBidRow, cnLabels, cnRoot } from './view.css';

export function TradesTableFull(props: TTradesTableFullProps): ReactElement {
    const { gridApi, onGridReady } = useGridApi<TOwnTrade>();
    const columns = useMemo(() => getColumns(props.timeZone), [props.timeZone]);

    const mergeFilters = useFunction(
        (originalModel: TOwnTradeFilter, newModel: TOwnTradeFilter): TOwnTradeFilter => ({
            ...originalModel,
            platformTime: { ...originalModel.platformTime, ...newModel.platformTime },
        }),
    );

    const [filterModel, updateFilterModel] = useFilterModel<TOwnTradeFilter>(gridApi, mergeFilters);
    const filteredData = useFilteredData(gridApi);
    const infinityDataSourceProps = useInfinityDataSource(gridApi, props);

    const currentRangeHashRef = useRef<number | undefined>(undefined);
    const hasSinceUserChangesRef = useRef<boolean>(false);
    const hasTillUserChangesRef = useRef<boolean>(false);

    const updateOwnTradesFilterModel = useFunction(
        (since: undefined | Dayjs, till: undefined | Dayjs) => {
            const propsSince = parseToDayjsInTimeZone(
                props.since,
                props.timeZone,
                EDateTimeFormats.Date,
            ).toISOString() as ISO;
            const propsTill = parseToDayjsInTimeZone(
                props.till,
                props.timeZone,
                EDateTimeFormats.Date,
            ).toISOString() as ISO;

            const newSince = (since?.toISOString() as ISO) ?? propsSince;
            const newTill = (till?.toISOString() as ISO) ?? propsTill;

            hasSinceUserChangesRef.current = newSince !== propsSince;
            hasTillUserChangesRef.current = newTill !== propsTill;

            updateFilterModel((model) => ({
                ...model,
                platformTime: {
                    since: newSince,
                    till: newTill,
                },
            }));
        },
    );

    useEffect(() => {
        const currentHash = shallowHash(props.since, props.till);
        const hasRangeChanges = currentRangeHashRef.current !== currentHash;
        currentRangeHashRef.current = currentHash;

        if (hasRangeChanges) {
            hasSinceUserChangesRef.current = false;
            hasTillUserChangesRef.current = false;
        } else if (hasSinceUserChangesRef.current && hasTillUserChangesRef.current) {
            return;
        }

        const platformTime: TOwnTradeFilter['platformTime'] = {};

        if (!hasSinceUserChangesRef.current || hasRangeChanges) {
            assign(platformTime, {
                since: parseToDayjsInTimeZone(props.since, props.timeZone).toISOString() as ISO,
            });
        }
        if (!hasTillUserChangesRef.current || hasRangeChanges) {
            assign(platformTime, {
                till: parseToDayjsInTimeZone(props.till, props.timeZone).toISOString() as ISO,
            });
        }

        updateFilterModel((model) => mergeFilters(model, { platformTime }));
    }, [updateFilterModel, props.since, props.till, props.timeZone, mergeFilters]);

    useScrollCallbacks(gridApi, props);

    const since = useMemo(
        () =>
            isNil(filterModel.platformTime?.since)
                ? undefined
                : dayjs(filterModel.platformTime?.since).utc(),
        [filterModel.platformTime?.since],
    );
    const till = useMemo(
        () =>
            isNil(filterModel.platformTime?.till)
                ? undefined
                : dayjs(filterModel.platformTime?.till).utc(),
        [filterModel.platformTime?.till],
    );

    const rowClassRules = useMemo(() => getRowClassRules(), []);

    const handleGetCSVOptions = useFunction(() => getCSVOptions(props.timeZone));

    const { onSelectionChanged, selectedRows } = useRowSelection<TOwnTrade>();

    return (
        <div className={cnRoot}>
            <TableLabels className={cnLabels}>
                <TableLabelRangeFilter
                    timeZone={props.timeZone}
                    since={since}
                    till={till}
                    onChange={updateOwnTradesFilterModel}
                />
                <TableLabelFiller />
                <TableLabelLastUpdate time={props.updateTime} timeZone={props.timeZone} />
                {props.exportFilename && (
                    <TableLabelExportData
                        selectedRows={selectedRows}
                        getData={filteredData.getFilteredData}
                        filename={props.exportFilename}
                        getOptions={handleGetCSVOptions}
                    />
                )}
            </TableLabels>
            <AgTableWithRouterSync
                {...infinityDataSourceProps}
                id={ETableIds.Trades}
                rowKey="tradeId"
                rowSelection="multiple"
                columnDefs={columns}
                onGridReady={onGridReady}
                rowClassRules={rowClassRules}
                onSelectionChanged={onSelectionChanged}
            />
        </div>
    );
}

function getRowClassRules(): RowClassRules<TOwnTrade> {
    return {
        [cnBidRow]: ({ data }: RowClassParams<TOwnTrade>) => data?.side == EOrderSide.Bid,
        [cnAskRow]: ({ data }: RowClassParams<TOwnTrade>) => data?.side == EOrderSide.Ask,
    };
}

async function getCSVOptions(timezone: TimeZone) {
    const fields = [
        {
            label: 'Platform time',
            value: (row: TOwnTrade) =>
                toDayjsWithTimezone(row.platformTime, timezone).format(
                    EDateTimeFormats.DateTimeMilliseconds,
                ),
        },
        {
            label: 'Exchange time',
            value: (row: TOwnTrade) =>
                toDayjsWithTimezone(row.exchangeTime, timezone).format(
                    EDateTimeFormats.DateTimeMilliseconds,
                ),
        },
        keyToField('strategy'),
        keyToField('robotName'),
        keyToField('exchangeName'),
        keyToField('gateName'),
        keyToField('virtualAccountName'),
        keyToField('accountName'),
        keyToField('instrumentName'),
        keyToField('role'),
        keyToField('side'),
        keyToField('price'),
        keyToField('baseAmount'),
        keyToField('baseAssetName'),
        keyToField('volumeAmount'),
        keyToField('volumeAssetName'),
        keyToField('feeAmount'),
        keyToField('feeAssetName'),
        keyToField('orderTag'),
        keyToField('tradeId'),
        keyToField('isLateTrade'),
        keyToField('isFeeEvaluated'),
    ];

    return { fields };

    function keyToField(key: string) {
        return {
            label: capitalize(lowerCase(key)),
            value: key,
        };
    }
}
