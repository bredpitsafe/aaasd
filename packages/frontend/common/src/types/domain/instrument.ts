import type { ISO, Opaque } from '@common/types';

import type { TAsset, TAssetId } from './asset';
import type { TExchange } from './exchange';
import type { TIndex, TIndexId } from './index';

export type TInstrument = {
    id: TInstrumentId;
    name: string;
    exchange: TExchange['name'];
    stepQty: TStepRules;
    stepPrice: TStepRules;
    minPrice: null | number;
    maxPrice: null | number;
    minQty: null | number;
    maxQty: null | number;
    minVolume: null | number;
    kind: TInstrumentKind;
    status: EInstrumentStatus;
    pnlMultiplier: number;
    amountNotation: TAmountNotation;
    priceNotation: TPriceNotation;
    href: null | string;
    providerMeta: TProviderMeta[];
};

export enum EOptionType {
    Call = 'Call',
    Put = 'Put',
}

export enum EOptionStyleType {
    European = 'European',
    American = 'American',
}

export type TOptionStyle =
    | {
          type: EOptionStyleType.European;
          settlementTime: ISO;
      }
    | {
          type: EOptionStyleType.American;
      };

export type TInstrumentId = Opaque<'InstrumentId', number>;

export enum EInstrumentKindType {
    InstantSpot = 'InstantSpot',
    Spot = 'Spot',
    PerpFutures = 'PerpFutures',
    Futures = 'Futures',
    Option = 'Option',
    InstrumentSwap = 'InstrumentSwap',
}

export type TInstrumentKindBase = {
    baseCurrency: TAssetId;
    baseCurrencyName: TAsset['name'];
    quoteCurrency: TAssetId;
    quoteCurrencyName: TAsset['name'];
};

export type TInstantSpotKind = TInstrumentKindBase & {
    type: EInstrumentKindType.InstantSpot;
};

export type TSpotKind = TInstrumentKindBase & {
    type: EInstrumentKindType.Spot;
    settlementTime: ISO;
    settlementType: TSettlementType;
};

export type TFutureKind = {
    type: EInstrumentKindType.Futures;
    startTime: ISO;
    expirationTime: ISO;
    underlying: TUnderlying;
    payoutNotation: TFuturesPayoutNotation;
    notional: TNotional;
    settlementTime: ISO;
    settlementType: TSettlementType;
};

export type TPerpFuturesKind = {
    type: EInstrumentKindType.PerpFutures;
    underlying: TUnderlying;
    payoutNotation: TFuturesPayoutNotation;
    notional: TNotional;
};

export type TInstrumentSwapKind = {
    type: EInstrumentKindType.InstrumentSwap;
    buyInstrumentId: TInstrumentId;
    buyInstrumentName: TInstrument['name'];
    sellInstrumentId: TInstrumentId;
    sellInstrumentName: TInstrument['name'];
};

export type TOptionKind = TInstrumentKindBase & {
    type: EInstrumentKindType.Option;
    underlying: TUnderlying;
    notional: TNotional;
    startTime: ISO;
    expirationTime: ISO;
    strikePrice: number;
    optionType: EOptionType;
    settlementType: TSettlementType;
    style: TOptionStyle;
};

export type TInstrumentKind =
    | TInstantSpotKind
    | TSpotKind
    | TPerpFuturesKind
    | TFutureKind
    | TOptionKind
    | TInstrumentSwapKind;

export type TInstrumentRecord = Record<TInstrumentId, TInstrument>;

export enum ESettlementType {
    FinanciallySettled = 'FinanciallySettled',
    PhysicallyDelivered = 'PhysicallyDelivered',
    ExercisesIntoInstrument = 'ExercisesIntoInstrument',
}

export type TSettlementType =
    | {
          type: ESettlementType.FinanciallySettled;
          assetId: TAssetId;
          assetName: TAsset['name'];
      }
    | {
          type: ESettlementType.PhysicallyDelivered;
          assetId: TAssetId;
          assetName: TAsset['name'];
          assetsPerContract: number;
      }
    | {
          type: ESettlementType.ExercisesIntoInstrument;
          instrumentId: TInstrumentId;
          instrumentName: TInstrument['name'];
          instrumentsPerContract: number;
      };

export type TFuturesPayoutNotation = {
    payoutUnitId: TFuturesPayoutUnit;
    payoutFunction: EFuturesPayoutFunction;
};

export enum EFuturesPayoutUnitType {
    Asset = 'Asset',
}

export type TFuturesPayoutUnit = {
    type: EFuturesPayoutUnitType.Asset;
    assetId: TAssetId;
    assetName: TAsset['name'];
};

export enum EFuturesPayoutFunction {
    NotionalValue = 'NotionalValue',
    PriceByNotionalValue = 'PriceByNotionalValue',
    NegRatioOfNotionalToPrice = 'NegRatioOfNotionalToPrice',
}

export enum EUnderlyingType {
    Asset = 'Asset',
    Instrument = 'Instrument',
    Index = 'Index',
}

export type TUnderlying =
    | {
          type: EUnderlyingType.Asset;
          assetId: TAssetId;
          assetName: TAsset['name'];
      }
    | {
          type: EUnderlyingType.Instrument;
          instrumentId: TInstrumentId;
          instrumentName: TInstrument['name'];
      }
    | {
          type: EUnderlyingType.Index;
          indexId: TIndexId;
          indexName: TIndex['name'];
      };

export enum ENotionalType {
    Asset = 'Asset',
    Instrument = 'Instrument',
    PriceProportional = 'PriceProportional',
}

export type TNotional =
    | {
          type: ENotionalType.Asset;
          assetId: TAssetId;
          assetName: TAsset['name'];
          assetsPerContract: number;
      }
    | {
          type: ENotionalType.Instrument;
          instrumentId: TInstrumentId;
          instrumentName: TInstrument['name'];
          instrumentsPerContract: number;
      }
    | {
          type: ENotionalType.PriceProportional;
          factor: number;
          priceSource: TPriceSource;
          notationAssetId: TAssetId;
          notationAssetName: TAsset['name'];
      };

export enum EPriceSourceType {
    Index = 'Index',
    Instrument = 'Instrument',
}

export type TPriceSource =
    | {
          type: EPriceSourceType.Index;
          indexId: TIndexId;
          indexName: TIndex['name'];
      }
    | {
          type: EPriceSourceType.Instrument;
          instrumentId: TInstrumentId;
          instrumentName: TInstrument['name'];
      };

export enum EInstrumentStatus {
    Trading = 'Trading',
    CloseOnly = 'CloseOnly',
    CancelOnly = 'CancelOnly',
    Halt = 'Halt',
    Delisted = 'Delisted',
    Forbidden = 'Forbidden',
}

export type TStepRules =
    | {
          type: EStepRulesName.Simple;
          value: number;
      }
    | {
          type: EStepRulesName.BithumbKrwPriceStep;
          value: undefined;
      }
    | {
          type: EStepRulesName.UpbitKrwPriceStep;
          value: undefined;
      }
    | {
          type: EStepRulesName.BitfinexPriceStep;
          value: undefined;
      }
    | {
          type: EStepRulesName.Table;
          value: undefined;
          tiers: TStepTableTier[];
      };

export type TStepTableTier = {
    boundary: number | undefined;
    step: number;
};

export enum EStepRulesName {
    Simple = 'Simple',
    BithumbKrwPriceStep = 'BithumbKrwPriceStep',
    UpbitKrwPriceStep = 'UpbitKrwPriceStep',
    BitfinexPriceStep = 'BitfinexPriceStep',
    Table = 'Table',
}

export enum EAmountNotationType {
    Asset = 'Asset',
    Instrument = 'Instrument',
    Index = 'Index',
}

export type TAmountNotation =
    | {
          type: EAmountNotationType.Asset;
          assetId: TAssetId;
          assetName: TAsset['name'];
          multiplier: number;
      }
    | {
          type: EAmountNotationType.Instrument;
          instrumentId: TInstrumentId;
          instrumentName: TInstrument['name'];
          multiplier: number;
      }
    | {
          type: EAmountNotationType.Index;
          indexId: TIndexId;
          indexName: TIndex['name'];
          multiplier: number;
      };

export enum EPriceNotationType {
    Ratio = 'Ratio',
}
export type TPriceNotation = {
    type: EPriceNotationType.Ratio;
    numerator: TRatioPriceNotationUnit;
    denominator: TRatioPriceNotationUnit;
    denominatorMultiplier: number;
};

export type TProviderMeta = {
    provider: string;
    meta: TMeta | null;
};

type TMeta = {
    [key: string]: string;
};

export enum ERatioPriceNotationUnitType {
    Index = 'Index',
    Asset = 'Asset',
    Instrument = 'Instrument',
}

export type TRatioPriceNotationUnit =
    | {
          type: ERatioPriceNotationUnitType.Asset;
          assetId: TAssetId;
          assetName: TAsset['name'];
      }
    | {
          type: ERatioPriceNotationUnitType.Instrument;
          instrumentId: TInstrumentId;
          instrumentName: TInstrument['name'];
      }
    | {
          type: ERatioPriceNotationUnitType.Index;
          indexId: TIndexId;
          indexName: TIndex['name'];
      };
