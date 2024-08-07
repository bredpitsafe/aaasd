import type {
    TAssetApprovalStatus,
    TIndexApprovalStatus,
    TInstrument,
    TInstrumentApprovalStatus,
    TInstrumentDynamicDataStatus,
    TInstrumentFuturesPayoutNotationFuturesPayoutFunction,
    TInstrumentKind,
    TInstrumentNotional,
    TInstrumentOptionCollateralizingType,
    TInstrumentOptionStyle,
    TInstrumentOptionType,
    TInstrumentSettlementType,
    TProviderInstrumentDetails,
    TProviderInstrumentDetailsFuturesPayoutNotationFuturesPayoutFunction,
    TProviderInstrumentDetailsNotional,
    TProviderInstrumentDetailsOptionCollateralizingType,
    TProviderInstrumentDetailsOptionStyle,
    TProviderInstrumentDetailsOptionType,
    TProviderInstrumentDetailsSettlementType,
    TProviderInstrumentSource,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';

import { assertType } from '../assert.ts';

export function kindToDisplayKind(
    value:
        | Exclude<TInstrument['kind'] | TProviderInstrumentDetails['kind'], undefined>['type']
        | TInstrumentKind,
): string {
    switch (value) {
        case 'instantSpot':
        case 'INSTRUMENT_KIND_INSTANT_SPOT':
            return 'Instant Spot';

        case 'spotDetails':
        case 'INSTRUMENT_KIND_SPOT':
            return 'Spot';

        case 'futuresDetails':
        case 'INSTRUMENT_KIND_FUTURES':
            return 'Futures';

        case 'perpFutures':
        case 'INSTRUMENT_KIND_PERP_FUTURES':
            return 'Perp Futures';

        case 'option':
        case 'INSTRUMENT_KIND_OPTION':
            return 'Option';

        case 'instrumentSwap':
        case 'INSTRUMENT_KIND_INSTRUMENT_SWAP':
            return 'Instrument Swap';

        case 'INSTRUMENT_KIND_UNSPECIFIED':
            return 'Unspecified';

        default:
            assertType(value, `Unknown kind "${value}"`);
            return value;
    }
}

export function statusToDisplayStatus(
    value: TInstrumentApprovalStatus | TAssetApprovalStatus | TIndexApprovalStatus,
): string {
    switch (value) {
        case 'INSTRUMENT_APPROVAL_STATUS_UNSPECIFIED':
        case 'ASSET_APPROVAL_STATUS_UNSPECIFIED':
        case 'INDEX_APPROVAL_STATUS_UNSPECIFIED':
            return 'Unspecified';
        case 'INSTRUMENT_APPROVAL_STATUS_UNREDUCED':
            return 'Unreduced';
        case 'INSTRUMENT_APPROVAL_STATUS_UNAPPROVED':
        case 'ASSET_APPROVAL_STATUS_UNAPPROVED':
        case 'INDEX_APPROVAL_STATUS_UNAPPROVED':
            return 'Unapproved';
        case 'INSTRUMENT_APPROVAL_STATUS_APPROVED':
        case 'ASSET_APPROVAL_STATUS_APPROVED':
        case 'INDEX_APPROVAL_STATUS_APPROVED':
            return 'Approved';
        case 'INSTRUMENT_APPROVAL_STATUS_BLOCKED':
            return 'Blocked';
        case 'INSTRUMENT_APPROVAL_STATUS_UNREDUCED_AFTER_APPROVAL':
            return 'Unreduced after approval';
        default:
            assertType(value, `Unknown status "${value}"`);
            return value;
    }
}

export function dynamicDataStatusToDisplayStatus(value: TInstrumentDynamicDataStatus): string {
    switch (value) {
        case 'STATUS_UNSPECIFIED':
            return 'Unspecified';
        case 'STATUS_TRADING':
            return 'Trading';
        case 'STATUS_CANCEL_ONLY':
            return 'Cancel only';
        case 'STATUS_HALTED':
            return 'Halted';
        case 'STATUS_DELISTED':
            return 'Delisted';
        case 'STATUS_FORBIDDEN':
            return 'Forbidden';
        default:
            assertType(value, `Unknown status "${value}"`);
            return value;
    }
}

export function settlementTypeToDisplaySettlementType(
    value: Exclude<
        (TInstrumentSettlementType | TProviderInstrumentDetailsSettlementType)['value'],
        undefined
    >['type'],
): string {
    switch (value) {
        case 'financiallySettled':
            return 'Financially settled';
        case 'physicallyDelivered':
            return 'Physically delivered';
        case 'exercisesIntoInstrument':
            return 'Exercises into instrument';
        default:
            assertType(value, `Unknown type "${value}"`);
            return value;
    }
}

export function instrumentNotionalTypeToDisplayType(
    value: Exclude<
        (TInstrumentNotional | TProviderInstrumentDetailsNotional)['value'],
        undefined
    >['type'],
): string {
    switch (value) {
        case 'asset':
            return 'Asset';
        case 'instrument':
            return 'Instrument';
        case 'priceProportional':
            return 'Price proportional';
        default:
            assertType(value, `Unknown type "${value}"`);
            return value;
    }
}

export function instrumentPayoutFunctionToDisplayPayoutFunction(
    value:
        | TInstrumentFuturesPayoutNotationFuturesPayoutFunction
        | TProviderInstrumentDetailsFuturesPayoutNotationFuturesPayoutFunction,
): string {
    switch (value) {
        case 'FUTURES_PAYOUT_FUNCTION_UNSPECIFIED':
            return 'Unspecified';
        case 'FUTURES_PAYOUT_FUNCTION_NOTIONAL_VALUE':
            return 'Notional value';
        case 'FUTURES_PAYOUT_FUNCTION_PRICE_BY_NOTATION_VALUE':
            return 'Price by notional value';
        case 'FUTURES_PAYOUT_FUNCTION_NEG_RATIO_OF_NOTIONAL_TO_PRICE':
            return 'Neg ratio of notional to price';
        default:
            assertType(value, `Unknown payout function "${value}"`);
            return value;
    }
}

export function instrumentCollateralizingTypeToDisplayType(
    value:
        | TInstrumentOptionCollateralizingType
        | TProviderInstrumentDetailsOptionCollateralizingType,
): string {
    switch (value) {
        case 'OPTION_COLLATERALIZING_TYPE_UNSPECIFIED':
            return 'Unspecified';
        case 'OPTION_COLLATERALIZING_TYPE_PREMIUM':
            return 'Premium';
        case 'OPTION_COLLATERALIZING_TYPE_MARGINED':
            return 'Margined';
        default:
            assertType(value, `Unknown collateralizing type "${value}"`);
            return value;
    }
}

export function instrumentOptionTypeToDisplayType(
    value: TInstrumentOptionType | TProviderInstrumentDetailsOptionType,
): string {
    switch (value) {
        case 'OPTION_TYPE_UNSPECIFIED':
            return 'Unspecified';
        case 'OPTION_TYPE_PUT':
            return 'Put';
        case 'OPTION_TYPE_CALL':
            return 'Call';
        default:
            assertType(value, `Unknown option type "${value}"`);
            return value;
    }
}

export function instrumentOptionStyleToDisplayStyle(
    value: Exclude<
        TInstrumentOptionStyle['value'] | TProviderInstrumentDetailsOptionStyle['value'],
        undefined
    >['type'],
): string {
    switch (value) {
        case 'european':
            return 'European';
        case 'american':
            return 'American';
        default:
            assertType(value, `Unknown type "${value}"`);
            return value;
    }
}

export function providerInstrumentSourceToDisplaySource(value: TProviderInstrumentSource): string {
    switch (value) {
        case 'SOURCE_UNSPECIFIED':
            return 'Unspecified';
        case 'SOURCE_TRANSFORMED':
            return 'Transformed';
        case 'SOURCE_OVERRIDE':
            return 'Override';
        default:
            assertType(value, `Unknown provider instrument source "${value}"`);
            return value;
    }
}
