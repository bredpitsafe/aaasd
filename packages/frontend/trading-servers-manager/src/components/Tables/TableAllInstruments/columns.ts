import type { TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import type { ColDef, ColGroupDef, SetFilterParams } from '@frontend/ag-grid';
import type { FilterModel, TAgGridSetFilter, TAgGridTextFilter } from '@frontend/ag-grid/src/types';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import { createTestProps } from '@frontend/common/e2e';
import { EDashboardsTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/dashboards-tab/dashboards.tab.selectors';
import { dateFormatter } from '@frontend/common/src/components/AgTable/formatters/date';
import { UrlRenderer } from '@frontend/common/src/components/AgTable/renderers/UrlRenderer';
import type { TInstrument } from '@frontend/common/src/types/domain/instrument';
import {
    EFuturesPayoutUnitType,
    EInstrumentKindType,
    EInstrumentStatus,
    ENotionalType,
    EOptionStyleType,
    EPriceSourceType,
    ERatioPriceNotationUnitType,
    ESettlementType,
    EStepRulesName,
    EUnderlyingType,
} from '@frontend/common/src/types/domain/instrument';
import { getExchangeLinkByName } from '@frontend/common/src/utils/exchangeLinks/getExchangeLinkByName';
import { isEmpty, isNil } from 'lodash-es';

import { cnNoPadding } from './cell.css';
import { ProviderMetaFieldView } from './components/ProviderMetaFieldView';
import { StatusRenderer } from './components/StatusRenderer';
import { StepPriceFieldView } from './components/StepPriceFieldView';
import { ValueGetterBuilder } from './utils';

const createAmountNotationColGroup = (): ColGroupDef<TInstrument> => ({
    groupId: 'amountNotation',
    headerName: 'Amount Notation',
    children: [
        {
            colId: 'amountNotation.asset',
            headerName: 'Asset',
            children: [
                {
                    field: 'amountNotation.assetId',
                    headerName: 'ID',
                    filter: EColumnFilterType.number,
                },
                {
                    field: 'amountNotation.assetName',
                    headerName: 'Name',
                    filter: EColumnFilterType.number,
                },
            ],
        },
        {
            colId: 'amountNotation.instrument',
            headerName: 'Instrument',
            children: [
                {
                    field: 'amountNotation.instrumentId',
                    headerName: 'ID',
                    filter: EColumnFilterType.number,
                },
                {
                    field: 'amountNotation.instrumentName',
                    headerName: 'Name',
                    filter: EColumnFilterType.number,
                },
            ],
        },
        {
            colId: 'amountNotation.index',
            headerName: 'Index',
            children: [
                {
                    field: 'amountNotation.indexId',
                    headerName: 'ID',
                    filter: EColumnFilterType.number,
                },
                {
                    field: 'amountNotation.indexName',
                    headerName: 'Name',
                    filter: EColumnFilterType.number,
                },
            ],
        },
        {
            field: 'amountNotation.multiplier',
            headerName: 'Multiplier',
        },
    ],
});

const NUMERATOR_SUB_COLUMNS = Object.keys(
    ERatioPriceNotationUnitType,
) as ERatioPriceNotationUnitType[];
const createPriceNotationNumeratorColumn = (
    col: keyof Pick<TInstrument['priceNotation'], 'numerator' | 'denominator'>,
) => {
    return NUMERATOR_SUB_COLUMNS.map((_key) => {
        const key = _key.toLowerCase();

        return {
            colId: `priceNotation.${col}.${key}`,
            headerName: key,
            children: [
                {
                    headerName: 'ID',
                    field: `priceNotation.${col}.${key}Id`,
                    filter: EColumnFilterType.number,
                },
                {
                    headerName: 'Name',
                    field: `priceNotation.${col}.${key}Name`,
                    filter: EColumnFilterType.number,
                },
            ],
        };
    });
};

const createPriceNotationColGroup = (): ColGroupDef<TInstrument> => ({
    groupId: 'priceNotation',
    headerName: 'Price Notation',
    children: [
        {
            colId: 'priceNotation.numerator',
            headerName: 'Numerator',
            children: createPriceNotationNumeratorColumn('numerator'),
        },
        {
            colId: 'priceNotation.denominator',
            headerName: 'Denominator',
            children: createPriceNotationNumeratorColumn('denominator'),
        },
        {
            field: 'priceNotation.denominatorMultiplier',
            headerName: 'Denominator Multiplier',
        },
    ],
});

const createBaseKindColumns = (
    type: EInstrumentKindType.InstantSpot | EInstrumentKindType.Spot | EInstrumentKindType.Option,
): ColDef<TInstrument>[] => {
    const BaseKindGetter = new ValueGetterBuilder<TInstrument>().addPath('kind').addCheckType(type);

    return [
        {
            headerName: 'Base Currency',
            colId: `${type}:base_currency`,
            valueGetter: BaseKindGetter.addPath('baseCurrency').build(),
        },
        {
            headerName: 'Base Currency Name',
            colId: `${type}:base_currency_name`,
            valueGetter: BaseKindGetter.addPath('baseCurrencyName').build(),
        },
        {
            headerName: 'Quote Currency',
            colId: `${type}:quote_currency`,
            valueGetter: BaseKindGetter.addPath('quoteCurrency').build(),
        },
        {
            headerName: 'Quote Currency Name',
            colId: `${type}:quote_currency_name`,
            valueGetter: BaseKindGetter.addPath('quoteCurrencyName').build(),
        },
    ];
};

const createInstantSpotColGroup = (): ColGroupDef<TInstrument> => ({
    groupId: EInstrumentKindType.InstantSpot,
    headerName: 'Instant spot',
    children: createBaseKindColumns(EInstrumentKindType.InstantSpot),
});

const createSettlementTypeColumns = (
    type: EInstrumentKindType.Spot | EInstrumentKindType.Futures | EInstrumentKindType.Option,
): ColGroupDef<TInstrument> => {
    const SettlementTypeFieldGetter = new ValueGetterBuilder<TInstrument>()
        .addPath('kind')
        .addCheckType(type)
        .addPath('settlementType');

    const FinanciallySettledFieldGetter = SettlementTypeFieldGetter.addCheckType(
        ESettlementType.FinanciallySettled,
    );
    const PhysicallyDeliveredFieldGetter = SettlementTypeFieldGetter.addCheckType(
        ESettlementType.PhysicallyDelivered,
    );
    const ExercisesIntoInstrumentFieldGetter = SettlementTypeFieldGetter.addCheckType(
        ESettlementType.ExercisesIntoInstrument,
    );

    return {
        headerName: 'Settlement Type',
        groupId: `${type}:settlement_type`,
        children: [
            {
                colId: `${type}.settlementType.financiallySettled`,
                headerName: 'Financially Settled',
                groupId: `${type}:settlement_type:financially_settled`,
                children: [
                    {
                        headerName: 'Asset Id',
                        colId: `${type}:settlement_type:financially_settled:asset_id`,
                        valueGetter: FinanciallySettledFieldGetter.addPath('assetId').build(),
                    },
                    {
                        headerName: 'Asset Name',
                        colId: `${type}:settlement_type:financially_settled:asset_name`,
                        valueGetter: FinanciallySettledFieldGetter.addPath('assetName').build(),
                    },
                ],
            },
            {
                colId: `${type}.settlementType.physicallyDelivered`,
                headerName: 'Physically Delivered',
                groupId: `${type}:settlement_type:physically_delivered`,
                children: [
                    {
                        headerName: 'Asset Id',
                        colId: `${type}:settlement_type:physically_delivered:asset_id`,
                        valueGetter: PhysicallyDeliveredFieldGetter.addPath('assetId').build(),
                    },
                    {
                        headerName: 'Asset Name',
                        colId: `${type}:settlement_type:physically_delivered:asset_name`,
                        valueGetter: PhysicallyDeliveredFieldGetter.addPath('assetName').build(),
                    },
                    {
                        headerName: 'Assets Per Contract',
                        colId: `${type}:settlement_type:physically_delivered:asset_per_contract`,
                        field: 'kind.settlementType.assetsPerContract',
                    },
                ],
            },
            {
                colId: `${type}.settlementType.exercisesIntoInstrument`,
                headerName: 'Exercises Into Instrument',
                groupId: `${type}:settlement_type:exercises_into_instrument`,
                children: [
                    {
                        headerName: 'Asset Id',
                        colId: `${type}:settlement_type:exercises_into_instrument:asset_id`,
                        valueGetter:
                            ExercisesIntoInstrumentFieldGetter.addPath('instrumentId').build(),
                    },
                    {
                        headerName: 'Asset Name',
                        colId: `${type}:settlement_type:exercises_into_instrument:asset_name`,
                        valueGetter:
                            ExercisesIntoInstrumentFieldGetter.addPath('instrumentName').build(),
                    },
                    {
                        headerName: 'Instruments Per Contract',
                        colId: `${type}:settlement_type:exercises_into_instrument:instruments_per_contract`,
                        field: 'kind.settlementType.instrumentsPerContract',
                    },
                ],
            },
        ],
    };
};

const createOptionStyleColumns = (
    type: EInstrumentKindType.Option,
    timeZone: TimeZone,
): ColGroupDef<TInstrument> => {
    const StyleFieldGetter = new ValueGetterBuilder<TInstrument>()
        .addPath('kind')
        .addCheckType(type)
        .addPath('style');

    return {
        headerName: 'Style',
        groupId: `${type}:style`,
        children: [
            {
                colId: `${type}:style:type`,
                headerName: 'Type',
                valueGetter: StyleFieldGetter.addPath('type').build(),
            },
            {
                headerName: 'Settlement time',
                colId: `${type}:style:settlement_time`,
                valueGetter: StyleFieldGetter.addCheckType(EOptionStyleType.European)
                    .addPath('settlementTime')
                    .build(),
                valueFormatter: dateFormatter(timeZone, EDateTimeFormats.DateTime),
            },
        ],
    };
};

const UNDERLYING_TYPE_LIST = Object.keys(EUnderlyingType) as EUnderlyingType[];
const createUnderlyingColumns = (
    type:
        | EInstrumentKindType.Futures
        | EInstrumentKindType.Option
        | EInstrumentKindType.PerpFutures,
): ColGroupDef<TInstrument> => {
    const UnderlyingFieldGetter = new ValueGetterBuilder<TInstrument>()
        .addPath('kind')
        .addCheckType(type)
        .addPath('underlying');

    return {
        headerName: 'Underlying',
        groupId: `${type}:underlying`,
        children: UNDERLYING_TYPE_LIST.map((underlyingType) => {
            return [
                {
                    colId: `${type}:underlying:${underlyingType}_id`,
                    headerName: underlyingType + ' ID',
                    valueGetter: UnderlyingFieldGetter.addCheckType(underlyingType)
                        .addPath(`${underlyingType.toLowerCase()}Id` as never)
                        .build(),
                },
                {
                    colId: `${type}:underlying:${underlyingType}_name`,
                    headerName: underlyingType + ' Name',
                    valueGetter: UnderlyingFieldGetter.addCheckType(underlyingType)
                        .addPath(`${underlyingType.toLowerCase()}Name` as never)
                        .build(),
                },
            ] as ColDef<TInstrument>[];
        }).flat(),
    };
};

const createPayoutNotationColumns = (
    type: EInstrumentKindType.Futures | EInstrumentKindType.PerpFutures,
): ColGroupDef<TInstrument> => {
    const UnderlyingFieldGetter = new ValueGetterBuilder<TInstrument>()
        .addPath('kind')
        .addCheckType(type)
        .addPath('payoutNotation');

    return {
        headerName: 'Payout Notation',
        groupId: `${type}:payout_notation`,
        children: [
            {
                colId: `${type}.payoutNotation.notationAsset`,
                headerName: 'Unit ID',
                groupId: `${type}:payout_notation:unit_id`,
                children: [
                    {
                        headerName: 'Asset ID',
                        colId: `${type}:payout_notation:unit_id:asset_id`,
                        valueGetter: UnderlyingFieldGetter.addPath('payoutUnitId')
                            .addCheckType(EFuturesPayoutUnitType.Asset)
                            .addPath('assetId')
                            .build(),
                    },
                    {
                        headerName: 'Asset Name',
                        colId: `${type}:payout_notation:unit_id:asset_name`,
                        valueGetter: UnderlyingFieldGetter.addPath('payoutUnitId')
                            .addCheckType(EFuturesPayoutUnitType.Asset)
                            .addPath('assetName')
                            .build(),
                    },
                ],
            },
            {
                headerName: 'Function',
                colId: `${type}:payout_notation:function`,
                valueGetter: UnderlyingFieldGetter.addPath('payoutFunction').build(),
            },
        ],
    };
};

const createNotionalColumns = (
    type:
        | EInstrumentKindType.Option
        | EInstrumentKindType.Futures
        | EInstrumentKindType.PerpFutures,
): ColGroupDef<TInstrument> => {
    const NotionalFieldGetter = new ValueGetterBuilder<TInstrument>()
        .addPath('kind')
        .addCheckType(type)
        .addPath('notional');
    const AssetFieldGetter = NotionalFieldGetter.addCheckType(ENotionalType.Asset);
    const InstrumentFieldGetter = NotionalFieldGetter.addCheckType(ENotionalType.Instrument);
    const PriceProportionalFieldGetter = NotionalFieldGetter.addCheckType(
        ENotionalType.PriceProportional,
    );
    const PriceSourceFieldGetter = PriceProportionalFieldGetter.addPath('priceSource');

    return {
        headerName: 'Notional',
        groupId: `${type}:notional`,
        children: [
            {
                colId: `${type}.notional.asset`,
                headerName: 'Asset',
                groupId: `${type}:notional:asset`,
                children: [
                    {
                        headerName: 'ID',
                        colId: `${type}:notional:asset:id`,
                        valueGetter: AssetFieldGetter.addPath('assetId').build(),
                    },
                    {
                        headerName: 'Name',
                        colId: `${type}:notional:asset:name`,
                        valueGetter: AssetFieldGetter.addPath('assetName').build(),
                    },
                    {
                        headerName: 'Per Contract',
                        colId: `${type}:notional:asset:per_contract`,
                        valueGetter: AssetFieldGetter.addPath('assetsPerContract').build(),
                    },
                ],
            },
            {
                colId: `${type}.notional.instrument`,
                headerName: 'Instrument',
                groupId: `${type}:notional:instrument`,
                children: [
                    {
                        headerName: 'ID',
                        colId: `${type}:notional:instrument:id`,
                        valueGetter: InstrumentFieldGetter.addPath('instrumentId').build(),
                    },
                    {
                        headerName: 'Name',
                        colId: `${type}:notional:instrument:name`,
                        valueGetter: InstrumentFieldGetter.addPath('instrumentName').build(),
                    },
                    {
                        headerName: 'Per Contract',
                        colId: `${type}:notional:instrument:per_contract`,
                        valueGetter:
                            InstrumentFieldGetter.addPath('instrumentsPerContract').build(),
                    },
                ],
            },
            {
                colId: `${type}.notional.priceProportional`,
                headerName: 'Price Proportional',
                groupId: `${type}:notional:price_proportional`,
                children: [
                    {
                        headerName: 'ID',
                        colId: `${type}:notional:price_proportional:id`,
                        valueGetter:
                            PriceProportionalFieldGetter.addPath('notationAssetId').build(),
                    },
                    {
                        headerName: 'Name',
                        colId: `${type}:notional:price_proportional:name`,
                        valueGetter:
                            PriceProportionalFieldGetter.addPath('notationAssetName').build(),
                    },
                    {
                        headerName: 'Factor',
                        colId: `${type}:notional:price_proportional:factor`,
                        valueGetter: PriceProportionalFieldGetter.addPath('factor').build(),
                    },
                    {
                        headerName: 'Price Source',
                        colId: `${type}:notional:price_proportional:price_source`,
                        children: [
                            {
                                headerName: 'Index ID',
                                colId: `${type}:notional:price_proportional:price_source:index_id`,
                                valueGetter: PriceSourceFieldGetter.addCheckType(
                                    EPriceSourceType.Index,
                                )
                                    .addPath('indexId')
                                    .build(),
                            },
                            {
                                headerName: 'Index Name',
                                colId: `${type}:notional:price_proportional:price_source:index_name`,
                                valueGetter: PriceSourceFieldGetter.addCheckType(
                                    EPriceSourceType.Index,
                                )
                                    .addPath('indexName')
                                    .build(),
                            },
                            {
                                headerName: 'Instr ID',
                                colId: `${type}:notional:price_proportional:price_source:instr_id`,
                                valueGetter: PriceSourceFieldGetter.addCheckType(
                                    EPriceSourceType.Instrument,
                                )
                                    .addPath('instrumentId')
                                    .build(),
                            },
                            {
                                headerName: 'Instr Name',
                                colId: `${type}:notional:price_proportional:price_source:instr_name`,
                                valueGetter: PriceSourceFieldGetter.addCheckType(
                                    EPriceSourceType.Instrument,
                                )
                                    .addPath('instrumentName')
                                    .build(),
                            },
                        ],
                    },
                ],
            },
        ],
    };
};

const createSpotColGroup = (timeZone: TimeZone): ColGroupDef<TInstrument> => ({
    groupId: EInstrumentKindType.Spot,
    headerName: 'Spot',
    children: [
        ...createBaseKindColumns(EInstrumentKindType.Spot),
        {
            colId: `${EInstrumentKindType.Spot}:settlementTime`,
            headerName: 'Settlement time',
            valueGetter: new ValueGetterBuilder<TInstrument>()
                .addPath('kind')
                .addCheckType(EInstrumentKindType.Spot)
                .addPath('settlementTime')
                .build(),
            valueFormatter: dateFormatter(timeZone, EDateTimeFormats.DateTime),
        },
        createSettlementTypeColumns(EInstrumentKindType.Spot),
    ],
});

const createPerpFuturesColGroup = (): ColGroupDef<TInstrument> => ({
    groupId: EInstrumentKindType.PerpFutures,
    headerName: 'PerpFutures',
    children: [
        createUnderlyingColumns(EInstrumentKindType.PerpFutures),
        createPayoutNotationColumns(EInstrumentKindType.PerpFutures),
        createNotionalColumns(EInstrumentKindType.PerpFutures),
    ],
});

const createFutureKindGetter = new ValueGetterBuilder<TInstrument>()
    .addPath('kind')
    .addCheckType(EInstrumentKindType.Futures);

const createFuturesColGroup = (timeZone: TimeZone): ColGroupDef<TInstrument> => ({
    groupId: EInstrumentKindType.Futures,
    headerName: 'Futures',
    children: [
        {
            colId: `${EInstrumentKindType.Futures}:start_time`,
            headerName: 'Start time',
            valueGetter: createFutureKindGetter.addPath('startTime').build(),
            valueFormatter: dateFormatter(timeZone, EDateTimeFormats.DateTime),
        },
        {
            colId: `${EInstrumentKindType.Futures}:expiration_time`,
            headerName: 'Expiration time',
            valueGetter: createFutureKindGetter.addPath('expirationTime').build(),
            valueFormatter: dateFormatter(timeZone, EDateTimeFormats.DateTime),
        },
        createUnderlyingColumns(EInstrumentKindType.Futures),
        createPayoutNotationColumns(EInstrumentKindType.Futures),
        createNotionalColumns(EInstrumentKindType.Futures),
        {
            colId: `${EInstrumentKindType.Futures}:settlement_time`,
            headerName: 'Settlement time',
            valueGetter: createFutureKindGetter.addPath('settlementTime').build(),
            valueFormatter: dateFormatter(timeZone, EDateTimeFormats.DateTime),
        },
        createSettlementTypeColumns(EInstrumentKindType.Futures),
    ],
});

const createOptionKindGetter = new ValueGetterBuilder<TInstrument>()
    .addPath('kind')
    .addCheckType(EInstrumentKindType.Option);

const createOptionsColGroup = (timeZone: TimeZone): ColGroupDef<TInstrument> => ({
    groupId: EInstrumentKindType.Option,
    headerName: 'Option',
    children: [
        ...createBaseKindColumns(EInstrumentKindType.Option),
        {
            colId: `${EInstrumentKindType.Option}:start_time`,
            headerName: 'Start time',
            valueGetter: createOptionKindGetter.addPath('startTime').build(),
            valueFormatter: dateFormatter(timeZone, EDateTimeFormats.DateTime),
        },
        {
            colId: `${EInstrumentKindType.Option}:expiration_time`,
            headerName: 'Expiration time',
            valueGetter: createOptionKindGetter.addPath('expirationTime').build(),
            valueFormatter: dateFormatter(timeZone, EDateTimeFormats.DateTime),
        },
        {
            colId: `${EInstrumentKindType.Option}:strike_price`,
            headerName: 'Strike price',
            valueGetter: createOptionKindGetter.addPath('strikePrice').build(),
        },
        {
            colId: `${EInstrumentKindType.Option}:option_type`,
            headerName: 'Option type',
            valueGetter: createOptionKindGetter.addPath('optionType').build(),
        },
        createOptionStyleColumns(EInstrumentKindType.Option, timeZone),
        createUnderlyingColumns(EInstrumentKindType.Option),
        createNotionalColumns(EInstrumentKindType.Option),
        createSettlementTypeColumns(EInstrumentKindType.Option),
    ],
});

const createInstrumentSwapKindGetter = new ValueGetterBuilder<TInstrument>()
    .addPath('kind')
    .addCheckType(EInstrumentKindType.InstrumentSwap);

const createInstrumentSwapColGroup = (): ColGroupDef<TInstrument> => ({
    groupId: EInstrumentKindType.InstrumentSwap,
    headerName: 'Instrument Swap',
    children: [
        {
            colId: `${EInstrumentKindType.InstrumentSwap}:buy_instr_id`,
            headerName: 'Buy Instr ID',
            valueGetter: createInstrumentSwapKindGetter.addPath('buyInstrumentId').build(),
        },
        {
            colId: `${EInstrumentKindType.InstrumentSwap}:buy_instr_name`,
            headerName: 'Buy Instr Name',
            valueGetter: createInstrumentSwapKindGetter.addPath('buyInstrumentName').build(),
        },
        {
            colId: `${EInstrumentKindType.InstrumentSwap}:sell_instr_id`,
            headerName: 'Sell Instr ID',
            valueGetter: createInstrumentSwapKindGetter.addPath('sellInstrumentId').build(),
        },
        {
            colId: `${EInstrumentKindType.InstrumentSwap}:sell_instr_name`,
            headerName: 'Sell Instr Name',
            valueGetter: createInstrumentSwapKindGetter.addPath('sellInstrumentName').build(),
        },
    ],
});

const createKindColGroup = (
    selectedKinds: EInstrumentKindType[] | undefined,
    timeZone: TimeZone,
): ColGroupDef<TInstrument> => {
    const kindColumnsMap = getKindColumnsMap(timeZone);

    return {
        headerName: 'Kind',
        groupId: `kind_group`,
        children: (selectedKinds || KIND_FILTER_OPTIONS).map(
            (selectedKind) => kindColumnsMap[selectedKind],
        ),
    };
};

export const STATUS_FILTER_OPTIONS: EInstrumentStatus[] = [
    EInstrumentStatus.Trading,
    EInstrumentStatus.CancelOnly,
    EInstrumentStatus.Forbidden,
    EInstrumentStatus.Halt,
    EInstrumentStatus.Delisted,
] as const;

const KIND_FILTER_OPTIONS = Object.values(EInstrumentKindType);

export interface TInstrumentsFilterModel extends FilterModel {
    kind: TAgGridSetFilter<EInstrumentKindType>;
    status: TAgGridSetFilter<EInstrumentStatus>;
    exchange: TAgGridTextFilter;
}

const COMMON_COLUMNS: ColDef<TInstrument>[] = [
    {
        headerName: 'ID',
        field: 'id',
        filter: EColumnFilterType.number,
    },
    {
        headerName: 'Name',
        field: 'name',
        cellRendererSelector: (params) => ({
            params: {
                url: isNil(params.data) ? undefined : getExchangeLinkByName(params.data)?.href,
                text: params.data?.name,
                ...createTestProps(EDashboardsTabSelectors.DashboardLink),
            },
            component: UrlRenderer,
        }),
    },
    {
        headerName: 'Exchange',
        field: 'exchange',
        filter: EColumnFilterType.text,
        floatingFilter: true,
    },
    {
        headerName: 'Kind',
        colId: 'kind',
        field: 'kind.type',
        filter: EColumnFilterType.set,
        filterParams: {
            buttons: ['apply', 'cancel'],
            closeOnApply: true,
            values: KIND_FILTER_OPTIONS,
            suppressSorting: true,
        } as SetFilterParams,
        floatingFilter: true,
    },
    {
        headerName: 'Status',
        field: 'status',
        cellRendererSelector: (params) => ({
            params: {
                status: params.data?.status,
            },
            component: StatusRenderer,
        }),
        filter: EColumnFilterType.set,
        filterParams: {
            buttons: ['apply', 'cancel'],
            closeOnApply: true,
            values: STATUS_FILTER_OPTIONS,
            suppressSorting: true,
        } as SetFilterParams,
        floatingFilter: true,
    },
    {
        headerName: 'Min. Price',
        field: 'minPrice',
        filter: EColumnFilterType.number,
    },
    {
        headerName: 'Max. Price',
        field: 'maxPrice',
        filter: EColumnFilterType.number,
    },
    {
        headerName: 'Min. Qty',
        field: 'minQty',
        filter: EColumnFilterType.number,
    },
    {
        headerName: 'Max. Qty',
        field: 'maxQty',
        filter: EColumnFilterType.number,
    },
    {
        headerName: 'Min. Vol.',
        field: 'minVolume',
        filter: EColumnFilterType.number,
    },
    {
        headerName: 'Price Step',
        field: 'stepPrice.value',
        cellClass: () => cnNoPadding,
        cellRenderer: StepPriceFieldView,
        comparator: (valueA, valueB, nodeA, nodeB) => {
            if (
                nodeA.data?.stepPrice.type === EStepRulesName.Table &&
                nodeB.data?.stepPrice.type === EStepRulesName.Table
            ) {
                if (nodeA.data.stepPrice.tiers[0].step === nodeB.data.stepPrice.tiers[0].step) {
                    return (
                        nodeA.data.stepPrice.tiers[nodeA.data.stepPrice.tiers.length - 1].step -
                        nodeB.data.stepPrice.tiers[nodeB.data.stepPrice.tiers.length - 1].step
                    );
                }
                return nodeA.data.stepPrice.tiers[0].step - nodeB.data.stepPrice.tiers[0].step;
            } else if (
                nodeA.data?.stepPrice.type === EStepRulesName.Table &&
                nodeB.data?.stepPrice.type !== EStepRulesName.Table
            ) {
                return -1;
            } else if (
                nodeA.data?.stepPrice.type !== EStepRulesName.Table &&
                nodeB.data?.stepPrice.type === EStepRulesName.Table
            ) {
                return 1;
            }
            return valueA - valueB;
        },
    },
    {
        headerName: 'Qty. Step',
        field: 'stepQty.value',
        filter: EColumnFilterType.number,
    },
    {
        headerName: 'PNL Mult.',
        field: 'pnlMultiplier',
        filter: EColumnFilterType.number,
    },
    {
        headerName: 'Provider Meta',
        field: 'providerMeta',
        cellClass: () => cnNoPadding,
        cellRenderer: ProviderMetaFieldView,
        comparator: (_valueA, _valueB, nodeA, nodeB) => {
            if (nodeA.data?.providerMeta[0]?.provider && nodeB.data?.providerMeta[0]?.provider) {
                return nodeB.data?.providerMeta[0]?.provider.localeCompare(
                    nodeA.data?.providerMeta[0]?.provider,
                );
            } else if (
                nodeA.data?.providerMeta[0]?.provider &&
                isNil(nodeB.data?.providerMeta[0]?.provider)
            ) {
                return 1;
            } else if (
                nodeB.data?.providerMeta[0]?.provider &&
                isNil(nodeA.data?.providerMeta[0]?.provider)
            ) {
                return -1;
            }
            return 0;
        },
    },
];

const getKindColumnsMap = (
    timeZone: TimeZone,
): Record<EInstrumentKindType, ColGroupDef<TInstrument>> => ({
    [EInstrumentKindType.InstantSpot]: createInstantSpotColGroup(),
    [EInstrumentKindType.Spot]: createSpotColGroup(timeZone),
    [EInstrumentKindType.InstrumentSwap]: createInstrumentSwapColGroup(),
    [EInstrumentKindType.Futures]: createFuturesColGroup(timeZone),
    [EInstrumentKindType.Option]: createOptionsColGroup(timeZone),
    [EInstrumentKindType.PerpFutures]: createPerpFuturesColGroup(),
});

export function getColumns(
    selectedKinds: EInstrumentKindType[] | undefined,
    timeZone: TimeZone,
): (ColDef<TInstrument> | ColGroupDef<TInstrument>)[] {
    if (isNil(selectedKinds) || isEmpty(selectedKinds) || selectedKinds.length > 1) {
        return [
            ...COMMON_COLUMNS,
            createKindColGroup(selectedKinds, timeZone),
            createAmountNotationColGroup(),
            createPriceNotationColGroup(),
        ];
    }

    const singleKindColumns = getKindColumnsMap(timeZone)[selectedKinds[0]];

    return [
        ...COMMON_COLUMNS,
        singleKindColumns,
        createAmountNotationColGroup(),
        createPriceNotationColGroup(),
    ];
}
