import { createTestProps } from '@frontend/common/e2e';
import { EDashboardsTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/dashboards-tab/dashboards.tab.selectors';
import { dateFormatter } from '@frontend/common/src/components/AgTable/formatters/date';
import { UrlRenderer } from '@frontend/common/src/components/AgTable/renderers/UrlRenderer';
import { EColumnFilterType } from '@frontend/common/src/components/AgTable/types';
import {
    EFuturesPayoutUnitType,
    EInstrumentKindType,
    ENotionalType,
    EOptionStyleType,
    EPriceSourceType,
    ERatioPriceNotationUnitType,
    ESettlementType,
    EUnderlyingType,
    TInstrument,
} from '@frontend/common/src/types/domain/instrument';
import { EDateTimeFormats, TimeZone } from '@frontend/common/src/types/time';
import { getExchangeLinkByName } from '@frontend/common/src/utils/exchangeLinks/getExchangeLinkByName';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { isNil } from 'lodash-es';

import { StatusRenderer } from './components/StatusRenderer';
import { ValueGetterBuilder } from './utils';

export const KIND_COL_ID = 'kind';
const createAmountNotationColGroup = (): ColGroupDef<TInstrument> => ({
    headerName: 'Amount Notation',
    children: [
        {
            headerName: 'Asset',
            children: [
                {
                    headerName: 'ID',
                    field: 'amountNotation.assetId',
                    filter: EColumnFilterType.number,
                },
                {
                    headerName: 'Name',
                    field: 'amountNotation.assetName',
                    filter: EColumnFilterType.number,
                },
            ],
        },
        {
            headerName: 'Instrument',
            children: [
                {
                    headerName: 'ID',
                    field: 'amountNotation.instrumentId',
                    filter: EColumnFilterType.number,
                },
                {
                    headerName: 'Name',
                    field: 'amountNotation.instrumentName',
                    filter: EColumnFilterType.number,
                },
            ],
        },
        {
            headerName: 'Multiplier',
            field: 'amountNotation.multiplier',
        },
    ],
});

const NUMERATOR_SUB_COLUMNS = Object.keys(
    ERatioPriceNotationUnitType,
) as ERatioPriceNotationUnitType[];
const createPriceNotationNumeratorColumn = (
    col: keyof Pick<TInstrument['priceNotation'], 'numerator' | 'denominator'>,
) => {
    return NUMERATOR_SUB_COLUMNS.map((key) => {
        return {
            headerName: key,
            children: [
                {
                    headerName: 'ID',
                    field: `priceNotation.${col}.${key.toLowerCase()}Id`,
                    filter: EColumnFilterType.number,
                },
                {
                    headerName: 'Name',
                    field: `priceNotation.${col}.${key.toLowerCase()}Name`,
                    filter: EColumnFilterType.number,
                },
            ],
        };
    });
};

const createPriceNotationColGroup = (): ColGroupDef<TInstrument> => ({
    headerName: 'Price Notation',
    children: [
        {
            headerName: 'Numerator',
            children: createPriceNotationNumeratorColumn('numerator'),
        },
        {
            headerName: 'Denominator',
            children: createPriceNotationNumeratorColumn('denominator'),
        },
        {
            headerName: 'Denominator Multiplier',
            field: 'priceNotation.denominatorMultiplier',
        },
    ],
});

const createBaseKindColumns = (
    type: EInstrumentKindType.InstantSpot | EInstrumentKindType.Spot | EInstrumentKindType.Option,
) => {
    const BaseKindGetter = new ValueGetterBuilder<TInstrument>().addPath('kind').addCheckType(type);

    return [
        {
            headerName: 'Base Currency',
            valueGetter: BaseKindGetter.addPath('baseCurrency').build(),
        },
        {
            headerName: 'Base Currency Name',
            valueGetter: BaseKindGetter.addPath('baseCurrencyName').build(),
        },
        {
            headerName: 'Quote Currency',
            valueGetter: BaseKindGetter.addPath('quoteCurrency').build(),
        },
        {
            headerName: 'Quote Currency Name',
            valueGetter: BaseKindGetter.addPath('quoteCurrencyName').build(),
        },
    ] as ColDef<TInstrument>[];
};

const createInstantSpotColGroup = (): ColGroupDef<TInstrument> => ({
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
        children: [
            {
                headerName: 'Financially Settled',
                children: [
                    {
                        headerName: 'Asset Id',
                        valueGetter: FinanciallySettledFieldGetter.addPath('assetId').build(),
                    },
                    {
                        headerName: 'Asset Name',
                        valueGetter: FinanciallySettledFieldGetter.addPath('assetName').build(),
                    },
                ],
            },
            {
                headerName: 'Physically Delivered',
                children: [
                    {
                        headerName: 'Asset Id',
                        valueGetter: PhysicallyDeliveredFieldGetter.addPath('assetId').build(),
                    },
                    {
                        headerName: 'Asset Name',
                        valueGetter: PhysicallyDeliveredFieldGetter.addPath('assetName').build(),
                    },
                    {
                        headerName: 'Assets Per Contract',
                        field: 'kind.settlementType.assetsPerContract',
                    },
                ],
            },
            {
                headerName: 'Exercises Into Instrument',
                children: [
                    {
                        headerName: 'Asset Id',
                        valueGetter:
                            ExercisesIntoInstrumentFieldGetter.addPath('instrumentId').build(),
                    },
                    {
                        headerName: 'Asset Name',
                        valueGetter:
                            ExercisesIntoInstrumentFieldGetter.addPath('instrumentName').build(),
                    },
                    {
                        headerName: 'Instruments Per Contract',
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
        children: [
            { headerName: 'Type', valueGetter: StyleFieldGetter.addPath('type').build() },
            {
                headerName: 'Settlement time',
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
        children: UNDERLYING_TYPE_LIST.map((type) => {
            return [
                {
                    headerName: type + ' ID',
                    valueGetter: UnderlyingFieldGetter.addCheckType(type)
                        .addPath(`${type.toLowerCase()}Id` as never)
                        .build(),
                },
                {
                    headerName: type + ' Name',
                    valueGetter: UnderlyingFieldGetter.addCheckType(type)
                        .addPath(`${type.toLowerCase()}Name` as never)
                        .build(),
                },
            ];
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
        children: [
            {
                headerName: 'Unit ID',
                children: [
                    {
                        headerName: 'Asset ID',
                        valueGetter: UnderlyingFieldGetter.addPath('payoutUnitId')
                            .addCheckType(EFuturesPayoutUnitType.Asset)
                            .addPath('assetId')
                            .build(),
                    },
                    {
                        headerName: 'Asset Name',
                        valueGetter: UnderlyingFieldGetter.addPath('payoutUnitId')
                            .addCheckType(EFuturesPayoutUnitType.Asset)
                            .addPath('assetName')
                            .build(),
                    },
                ],
            },
            {
                headerName: 'Function',
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
        children: [
            {
                headerName: 'Asset',
                children: [
                    {
                        headerName: 'ID',
                        valueGetter: AssetFieldGetter.addPath('assetId').build(),
                    },
                    {
                        headerName: 'Name',
                        valueGetter: AssetFieldGetter.addPath('assetName').build(),
                    },
                    {
                        headerName: 'Per Contract',
                        valueGetter: AssetFieldGetter.addPath('assetsPerContract').build(),
                    },
                ],
            },
            {
                headerName: 'Instrument',
                children: [
                    {
                        headerName: 'ID',
                        valueGetter: InstrumentFieldGetter.addPath('instrumentId').build(),
                    },
                    {
                        headerName: 'Name',
                        valueGetter: InstrumentFieldGetter.addPath('instrumentName').build(),
                    },
                    {
                        headerName: 'Per Contract',
                        valueGetter:
                            InstrumentFieldGetter.addPath('instrumentsPerContract').build(),
                    },
                ],
            },
            {
                headerName: 'Price Proportional',
                children: [
                    {
                        headerName: 'ID',
                        valueGetter:
                            PriceProportionalFieldGetter.addPath('notationAssetId').build(),
                    },
                    {
                        headerName: 'Name',
                        valueGetter:
                            PriceProportionalFieldGetter.addPath('notationAssetName').build(),
                    },
                    {
                        headerName: 'Factor',
                        valueGetter: PriceProportionalFieldGetter.addPath('factor').build(),
                    },
                    {
                        headerName: 'Price Source',
                        children: [
                            {
                                headerName: 'Index ID',
                                valueGetter: PriceSourceFieldGetter.addCheckType(
                                    EPriceSourceType.Index,
                                )
                                    .addPath('indexId')
                                    .build(),
                            },
                            {
                                headerName: 'Index Name',
                                valueGetter: PriceSourceFieldGetter.addCheckType(
                                    EPriceSourceType.Index,
                                )
                                    .addPath('indexName')
                                    .build(),
                            },
                            {
                                headerName: 'Instr ID',
                                valueGetter: PriceSourceFieldGetter.addCheckType(
                                    EPriceSourceType.Instrument,
                                )
                                    .addPath('instrumentId')
                                    .build(),
                            },
                            {
                                headerName: 'Instr Name',
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
    headerName: 'Spot',
    children: [
        ...createBaseKindColumns(EInstrumentKindType.Spot),
        {
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
    headerName: 'Futures',
    children: [
        {
            headerName: 'Start time',
            valueGetter: createFutureKindGetter.addPath('startTime').build(),
            valueFormatter: dateFormatter(timeZone, EDateTimeFormats.DateTime),
        },
        {
            headerName: 'Expiration time',
            valueGetter: createFutureKindGetter.addPath('expirationTime').build(),
            valueFormatter: dateFormatter(timeZone, EDateTimeFormats.DateTime),
        },
        createUnderlyingColumns(EInstrumentKindType.Futures),
        createPayoutNotationColumns(EInstrumentKindType.Futures),
        createNotionalColumns(EInstrumentKindType.Futures),
        {
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
    headerName: 'Option',
    children: [
        ...createBaseKindColumns(EInstrumentKindType.Option),
        {
            headerName: 'Start time',
            valueGetter: createOptionKindGetter.addPath('startTime').build(),
            valueFormatter: dateFormatter(timeZone, EDateTimeFormats.DateTime),
        },
        {
            headerName: 'Expiration time',
            valueGetter: createOptionKindGetter.addPath('expirationTime').build(),
            valueFormatter: dateFormatter(timeZone, EDateTimeFormats.DateTime),
        },
        {
            headerName: 'Strike price',
            valueGetter: createOptionKindGetter.addPath('strikePrice').build(),
        },
        {
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
    headerName: 'Instrument Swap',
    children: [
        {
            headerName: 'Buy Instr ID',
            valueGetter: createInstrumentSwapKindGetter.addPath('buyInstrumentId').build(),
        },
        {
            headerName: 'Buy Instr Name',
            valueGetter: createInstrumentSwapKindGetter.addPath('buyInstrumnetName').build(),
        },
        {
            headerName: 'Sell Instr ID',
            valueGetter: createInstrumentSwapKindGetter.addPath('sellInstrumentId').build(),
        },
        {
            headerName: 'Sell Instr Name',
            valueGetter: createInstrumentSwapKindGetter.addPath('sellInstrumnetName').build(),
        },
    ],
});

const createKindColGroup = (timeZone: TimeZone): ColGroupDef<TInstrument> => ({
    headerName: 'Kind',
    children: [
        createInstantSpotColGroup(),
        createSpotColGroup(timeZone),
        createPerpFuturesColGroup(),
        createFuturesColGroup(timeZone),
        createOptionsColGroup(timeZone),
        createInstrumentSwapColGroup(),
    ],
});

type TGetColumnsParams = {
    kind: EInstrumentKindType | undefined;
    timeZone: TimeZone;
};

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
        filter: EColumnFilterType.set,
    },
    {
        headerName: 'Kind',
        colId: KIND_COL_ID,
        field: 'kind.type',
        filter: EColumnFilterType.set,
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
        filter: EColumnFilterType.number,
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
];

const kindColumnsMap = (
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
    params: TGetColumnsParams,
): (ColDef<TInstrument> | ColGroupDef<TInstrument>)[] {
    // If no kind is selected, return all columns
    // If some kind is selected, return common columns + this kind column set
    if (isNil(params.kind)) {
        return [
            ...COMMON_COLUMNS,
            createKindColGroup(params.timeZone),
            createAmountNotationColGroup(),
            createPriceNotationColGroup(),
        ];
    }

    const kindColumns = kindColumnsMap(params.timeZone)[params.kind];

    return [
        ...COMMON_COLUMNS,
        kindColumns,
        createAmountNotationColGroup(),
        createPriceNotationColGroup(),
    ];
}
