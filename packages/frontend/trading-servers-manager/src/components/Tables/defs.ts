import type {
    TInstrument,
    TInstrumentDynamicData,
    TInstrumentDynamicDataPriceStepRules,
    TInstrumentDynamicDataStatus,
    TInstrumentFuturesPayoutNotation,
    TInstrumentInstrumentSwapDetails,
    TInstrumentMarginNotation,
    TInstrumentNotional,
    TInstrumentOptionDetails,
    TInstrumentSettlementType,
    TInstrumentUnderlying,
    TProviderInstrument,
    TProviderInstrumentDetails,
    TProviderInstrumentDetailsAmountNotation,
    TProviderInstrumentDetailsFuturesPayoutNotation,
    TProviderInstrumentDetailsInstrumentSwapDetails,
    TProviderInstrumentDetailsMarginNotation,
    TProviderInstrumentDetailsNotional,
    TProviderInstrumentDetailsOptionDetails,
    TProviderInstrumentDetailsPriceNotation,
    TProviderInstrumentDetailsSettlementType,
    TProviderInstrumentDetailsUnderlying,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ISO } from '@common/types';

import type { TRevisionList } from '../../types/instruments.ts';

export type TFullInstrument = TInstrument & TInstrumentDynamicData;

export enum EPropertyGroup {
    BaseProperties = 'Base Properties',
    DynamicData = 'Dynamic Details',
    AmountNotation = 'Amount Notation',
    PriceNotation = 'Price Notation',
    Settlement = 'Settlement',
    Notional = 'Notional',
    Underlying = 'Underlying',
    Spot = 'Instant Spot / Spot',
    StartExpiration = 'Start / Expiration',
    PayoutNotation = 'Payout Notation',
    MarginNotation = 'Margin Notation',
    Option = 'Option',
    InstrumentSwap = 'Instrument Swap',
    Revision = 'Revision',
}

export enum EDataKind {
    Number = 'Number',
    String = 'String',
    Select = 'Select',
    InstrumentApprovalStatus = 'InstrumentApprovalStatus',
    StepPrice = 'StepPrice',
    DynamicDataStatus = 'DynamicDataStatus',
    DateTime = 'DateTime',
    RevisionDateTime = 'RevisionDateTime',
}

export const ProviderInstrumentPropertyName = {
    BasePropertiesKind: 'Kind',
    BasePropertiesName: 'Name',
    BasePropertiesSource: 'Source',
    BasePropertiesDate: 'Date',
    BasePropertiesProvider: 'Provider',

    AmountNotationAssetName: 'Asset Name',
    AmountNotationAssetMultiplier: 'Asset Multiplier',
    AmountNotationInstrumentName: 'Instrument Name',
    AmountNotationInstrumentMultiplier: 'Instrument Multiplier',
    AmountNotationIndexName: 'Index Name',
    AmountNotationIndexMultiplier: 'Index Multiplier',

    PriceNotationNumeratorAssetName: 'Numerator Asset Name',
    PriceNotationNumeratorInstrumentName: 'Numerator Instrument Name',
    PriceNotationNumeratorIndexName: 'Numerator Index Name',
    PriceNotationDenominatorAssetName: 'Denominator Asset Name',
    PriceNotationDenominatorInstrumentName: 'Denominator Instrument Name',
    PriceNotationDenominatorIndexName: 'Denominator Index Name',
    PriceNotationDenominatorMultiplier: 'Denominator Multiplier',

    SettlementType: 'Type',
    SettlementTime: 'Time',
    SettlementAssetName: 'Asset Name',
    SettlementAssetsPerContract: 'Assets Per Contract',
    SettlementInstrumentName: 'Instrument Name',
    SettlementInstrumentsPerContract: 'Instruments Per Contract',

    NotionalKind: 'Notional Kind',
    NotionalAssetName: 'Asset Name',
    NotionalAssetsPerContract: 'Assets Per Contract',
    NotionalInstrumentName: 'Instrument Name',
    NotionalInstrumentsPerContract: 'Instruments Per Contract',
    NotionalFactor: 'Factor',
    NotionalNotationAssetName: 'Notation Asset Name',
    NotionalPriceSourceInstrumentName: 'Price Source Instrument Name',
    NotionalPriceSourceIndexName: 'Price Source Index Name',

    UnderlyingAssetName: 'Asset Name',
    UnderlyingInstrumentName: 'Instrument Name',
    UnderlyingIndexName: 'Index Name',

    SpotBaseAssetName: 'Base Asset Name',
    SpotQuoteAssetName: 'Quote Asset Name',

    StartExpirationStartTime: 'Start Time',
    StartExpirationExpirationTime: 'Expiration Time',

    PayoutNotationUnitAssetName: 'Unit Asset Name',
    PayoutNotationFunction: 'Function',

    MarginNotationAssetName: 'Asset Name',

    OptionCollateralizingType: 'Collateralizing Type',
    OptionType: 'Option Type',
    OptionStyle: 'Option Style',
    OptionStrikePrice: 'Strike Price',

    InstrumentSwapBuyInstrumentName: 'Buy Instrument Name',
    InstrumentSwapSellInstrumentName: 'Sell Instrument Name',
};

export const InstrumentPropertyName = {
    BasePropertiesId: 'ID',
    BasePropertiesKind: 'Kind',
    BasePropertiesName: 'Name',
    BasePropertiesApprovalStatus: 'Approval Status',
    BasePropertiesStatus: 'Status',
    BasePropertiesExchange: 'Exchange',

    DynamicDataMinPrice: 'Min. Price',
    DynamicDataMaxPrice: 'Max. Price',
    DynamicDataMinQty: 'Min. Qty',
    DynamicDataMaxQty: 'Max. Qty',
    DynamicDataMinVolume: 'Min. Volume',
    DynamicDataStepPrice: 'Step Price',
    DynamicDataStepQty: 'Step Qty',

    AmountNotationAssetId: 'Asset ID',
    AmountNotationAssetMultiplier: 'Asset Multiplier',
    AmountNotationInstrumentId: 'Instrument ID',
    AmountNotationInstrumentMultiplier: 'Instrument Multiplier',
    AmountNotationIndexId: 'Index ID',
    AmountNotationIndexMultiplier: 'Index Multiplier',

    PriceNotationNumeratorAssetId: 'Numerator Asset ID',
    PriceNotationNumeratorInstrumentId: 'Numerator Instrument ID',
    PriceNotationNumeratorIndexId: 'Numerator Index ID',
    PriceNotationDenominatorAssetId: 'Denominator Asset ID',
    PriceNotationDenominatorInstrumentId: 'Denominator Instrument ID',
    PriceNotationDenominatorIndexId: 'Denominator Index ID',
    PriceNotationDenominatorMultiplier: 'Denominator Multiplier',

    SettlementType: 'Type',
    SettlementTime: 'Time',
    SettlementAssetId: 'Asset ID',
    SettlementAssetsPerContract: 'Assets Per Contract',
    SettlementInstrumentId: 'Instrument ID',
    SettlementInstrumentsPerContract: 'Instruments Per Contract',

    NotionalKind: 'Notional Kind',
    NotionalAssetId: 'Asset ID',
    NotionalAssetsPerContract: 'Assets Per Contract',
    NotionalInstrumentId: 'Instrument ID',
    NotionalInstrumentsPerContract: 'Instruments Per Contract',
    NotionalFactor: 'Factor',
    NotionalNotationAssetId: 'Notation Asset ID',
    NotionalPriceSourceInstrumentId: 'Price Source Instrument ID',
    NotionalPriceSourceIndexId: 'Price Source Index ID',

    UnderlyingAssetId: 'Asset ID',
    UnderlyingInstrumentId: 'Instrument ID',
    UnderlyingIndexId: 'Index ID',

    SpotBaseAssetId: 'Base Asset ID',
    SpotQuoteAssetId: 'Quote Asset ID',

    StartExpirationStartTime: 'Start Time',
    StartExpirationExpirationTime: 'Expiration Time',

    PayoutNotationUnitAssetId: 'Unit Asset ID',
    PayoutNotationFunction: 'Function',

    MarginNotationAssetId: 'Asset ID',

    OptionCollateralizingType: 'Collateralizing Type',
    OptionType: 'Option Type',
    OptionStyle: 'Option Style',
    OptionStrikePrice: 'Strike Price',

    InstrumentSwapBuyInstrumentId: 'Buy Instrument ID',
    InstrumentSwapSellInstrumentId: 'Sell Instrument ID',

    RevisionUser: 'User',
    RevisionDate: 'Date',
};

export type TCellError = {
    group: EPropertyGroup;
    property: string;
    message: string;
};

export type TPropertyRevisionCell =
    | { data: number | undefined; kind: EDataKind.Number; hasDiff: boolean }
    | { data: string | undefined; kind: EDataKind.String; hasDiff: boolean }
    | { data: TInstrument; kind: EDataKind.InstrumentApprovalStatus; hasDiff: boolean }
    | { data: ISO | undefined; kind: EDataKind.DateTime; hasDiff: boolean };

export type TPropertyCell =
    | { data: number | undefined; kind: EDataKind.Number; errors?: string[] }
    | { data: string | undefined; kind: EDataKind.String; errors?: string[] }
    | { data: TInstrument; kind: EDataKind.InstrumentApprovalStatus; errors?: string[] }
    | { data: TInstrumentDynamicDataPriceStepRules; kind: EDataKind.StepPrice; errors?: string[] }
    | { data: TInstrumentDynamicDataStatus; kind: EDataKind.DynamicDataStatus; errors?: string[] }
    | { data: ISO | undefined; kind: EDataKind.DateTime; errors?: string[] }
    | {
          data: { date: ISO; instrument: TInstrument };
          kind: EDataKind.RevisionDateTime;
          errors?: string[];
      };

export type TSelectCellEditorParams = {
    values: (string | number)[];
    valueFormatter?: (value: string | number) => string;
    suppressEmpty?: boolean;
    defaultValue?: string | number;
};

export type TEditablePropertyCell =
    | { editable: false; data: undefined; kind: undefined; errors?: string[] }
    | { data: number | undefined; kind: EDataKind.Number; editable: true; errors?: string[] }
    | { data: string | undefined; kind: EDataKind.String; editable: true; errors?: string[] }
    | {
          data: string | number | undefined;
          params: TSelectCellEditorParams;
          kind: EDataKind.Select;
          editable: true;
          errors?: string[];
      }
    | { data: ISO | undefined; kind: EDataKind.DateTime; editable: true; errors?: string[] };

export type TOverrideProviderInstrument = Partial<
    Record<EPropertyGroup, Record<string, TEditablePropertyCell>>
>;

export type TPropertyRow = { group: string; property: string; errors?: string[] } & Record<
    `indicator-id-${number}`,
    TPropertyCell
>;

export type TRevisionPropertyRow = { group: string; property: string; hasDiff: boolean } & Record<
    `indicator-id-${number}-rev-${ISO | 'latest'}`,
    TPropertyRevisionCell
>;

export type TRevisionProviderPropertyRow = {
    group: string;
    property: string;
    hasDiff: boolean;
} & Record<
    `indicator-name-${string}-rev-${ISO | 'latest'}-provider-${string}-rev-${ISO}`,
    TPropertyRevisionCell
>;

export type TProviderPropertyRow = {
    group: string;
    property: string;
    override: undefined | TEditablePropertyCell;
} & Record<`indicator-id-${number}|order-${number}`, TPropertyCell>;

export type TPackedInstrument = Pick<
    TInstrument,
    'id' | 'name' | 'user' | 'approvalStatus' | 'amountNotation' | 'priceNotation' | 'exchange'
> & {
    instrument: TInstrument;

    kind: undefined | Exclude<TInstrument['kind'], undefined>['type'];
    settlement:
        | undefined
        | {
              type: undefined | Exclude<TInstrumentSettlementType['value'], undefined>;
              time: undefined | ISO;
          };
    notional: undefined | Exclude<TInstrumentNotional['value'], undefined>;
    underlying: undefined | Exclude<TInstrumentUnderlying['value'], undefined>;
    baseAssetId: undefined | number;
    quoteAssetId: undefined | number;
    startTime: undefined | ISO;
    expirationTime: undefined | ISO;
    payoutNotation: undefined | TInstrumentFuturesPayoutNotation;
    marginNotation: undefined | Exclude<TInstrumentMarginNotation['value'], undefined>;
    option: undefined | TInstrumentOptionDetails;
    instrumentSwap: undefined | TInstrumentInstrumentSwapDetails;
    platformTime: ISO;

    latest: boolean;
};

export type TPackedFullInstrument = Omit<TPackedInstrument, 'latest'> &
    Pick<
        TInstrumentDynamicData,
        | 'status'
        | 'minPrice'
        | 'maxPrice'
        | 'minQty'
        | 'maxQty'
        | 'minVolume'
        | 'priceStepRules'
        | 'amountStepRules'
    >;

export type TPackedProviderInstrument = Pick<
    TProviderInstrument,
    'name' | 'source' | 'provider'
> & {
    platformInstrument: TInstrument;
    providerInstrument: TProviderInstrument;

    instrumentId: number;
    order: number;
    kind: undefined | Exclude<TProviderInstrumentDetails['kind'], undefined>['type'];
    platformTime: ISO;
    amountNotation: undefined | TProviderInstrumentDetailsAmountNotation;
    priceNotation: undefined | TProviderInstrumentDetailsPriceNotation;
    settlement:
        | undefined
        | {
              type:
                  | undefined
                  | Exclude<TProviderInstrumentDetailsSettlementType['value'], undefined>;
              time: undefined | ISO;
          };
    notional: undefined | Exclude<TProviderInstrumentDetailsNotional['value'], undefined>;
    underlying: undefined | Exclude<TProviderInstrumentDetailsUnderlying['value'], undefined>;
    baseAssetName: undefined | string;
    quoteAssetName: undefined | string;
    startTime: undefined | ISO;
    expirationTime: undefined | ISO;
    payoutNotation: undefined | TProviderInstrumentDetailsFuturesPayoutNotation;
    marginNotation:
        | undefined
        | Exclude<TProviderInstrumentDetailsMarginNotation['value'], undefined>;

    option: undefined | TProviderInstrumentDetailsOptionDetails;
    instrumentSwap: undefined | TProviderInstrumentDetailsInstrumentSwapDetails;
    errors: undefined | TCellError[];

    latest?: boolean;
};

export type TInstrumentWithRevisions =
    | {
          instrumentId: number;
          platformTime: TRevisionList;
      }
    | number;
