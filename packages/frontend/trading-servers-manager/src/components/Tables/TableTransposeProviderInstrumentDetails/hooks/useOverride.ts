import type {
    TProviderInstrumentDetails,
    TProviderInstrumentDetailsFuturesPayoutNotationFuturesPayoutFunction,
    TProviderInstrumentDetailsNotional,
    TProviderInstrumentDetailsOptionCollateralizingType,
    TProviderInstrumentDetailsOptionStyle,
    TProviderInstrumentDetailsOptionType,
    TProviderInstrumentDetailsSettlementType,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { Nil } from '@common/types';
import {
    instrumentCollateralizingTypeToDisplayType,
    instrumentNotionalTypeToDisplayType,
    instrumentOptionStyleToDisplayStyle,
    instrumentOptionTypeToDisplayType,
    instrumentPayoutFunctionToDisplayPayoutFunction,
    kindToDisplayKind,
    settlementTypeToDisplaySettlementType,
} from '@frontend/common/src/utils/instruments/converters.ts';
import { hasInstrumentMarginNotation } from '@frontend/common/src/utils/instruments/hasInstrumentMarginNotation.ts';
import { hasInstrumentNotional } from '@frontend/common/src/utils/instruments/hasInstrumentNotional.ts';
import { hasInstrumentPayoutNotation } from '@frontend/common/src/utils/instruments/hasInstrumentPayoutNotation.ts';
import { hasInstrumentSettlement } from '@frontend/common/src/utils/instruments/hasInstrumentSettlement.ts';
import { hasInstrumentSpotData } from '@frontend/common/src/utils/instruments/hasInstrumentSpotData.ts';
import { hasInstrumentStartExpiration } from '@frontend/common/src/utils/instruments/hasInstrumentStartExpiration.ts';
import { hasInstrumentUnderlying } from '@frontend/common/src/utils/instruments/hasInstrumentUnderlying.ts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { isNil, isString, mapValues } from 'lodash-es';
import { useState } from 'react';

import type { TEditablePropertyCell, TOverrideProviderInstrument } from '../../defs.ts';
import { EDataKind, EPropertyGroup, ProviderInstrumentPropertyName } from '../../defs.ts';

const SKIP_EDITOR: TEditablePropertyCell = {
    editable: false,
    data: undefined,
    kind: undefined,
};

const STRING_EDITOR: TEditablePropertyCell = {
    data: undefined,
    kind: EDataKind.String,
    editable: true,
};

const NUMBER_EDITOR: TEditablePropertyCell = {
    data: undefined,
    kind: EDataKind.Number,
    editable: true,
};

const DATETIME_EDITOR: TEditablePropertyCell = {
    data: undefined,
    kind: EDataKind.DateTime,
    editable: true,
};

const SETTLEMENT_TYPE_OVERRIDE: TEditablePropertyCell = {
    data: undefined,
    params: {
        values: ['financiallySettled', 'physicallyDelivered', 'exercisesIntoInstrument'],
        valueFormatter: (value) =>
            settlementTypeToDisplaySettlementType(
                value as Exclude<
                    TProviderInstrumentDetailsSettlementType['value'],
                    undefined
                >['type'],
            ),
    },
    kind: EDataKind.Select,
    editable: true,
};

const NOTIONAL_KIND_OVERRIDE: TEditablePropertyCell = {
    data: undefined,
    params: {
        values: ['asset', 'instrument', 'priceProportional'],
        valueFormatter: (value) =>
            instrumentNotionalTypeToDisplayType(
                value as Exclude<TProviderInstrumentDetailsNotional['value'], undefined>['type'],
            ),
    },
    kind: EDataKind.Select,
    editable: true,
};

const OPTION_COLLATERALIZING_TYPE_OVERRIDE: TEditablePropertyCell = {
    data: undefined,
    params: {
        values: ['OPTION_COLLATERALIZING_TYPE_PREMIUM', 'OPTION_COLLATERALIZING_TYPE_MARGINED'],
        valueFormatter: (value) =>
            instrumentCollateralizingTypeToDisplayType(
                value as TProviderInstrumentDetailsOptionCollateralizingType,
            ),
    },
    kind: EDataKind.Select,
    editable: true,
};

const OPTION_TYPE_OVERRIDE: TEditablePropertyCell = {
    data: undefined,
    params: {
        values: ['OPTION_TYPE_PUT', 'OPTION_TYPE_CALL'],
        valueFormatter: (value) =>
            instrumentOptionTypeToDisplayType(value as TProviderInstrumentDetailsOptionType),
    },
    kind: EDataKind.Select,
    editable: true,
};

const OPTION_STYLE_OVERRIDE: TEditablePropertyCell = {
    data: undefined,
    params: {
        values: ['european', 'american'],
        valueFormatter: (value) =>
            instrumentOptionStyleToDisplayStyle(
                value as Exclude<TProviderInstrumentDetailsOptionStyle['value'], undefined>['type'],
            ),
    },
    kind: EDataKind.Select,
    editable: true,
};

const PAYOUT_NOTATION_FUNCTION_OVERRIDE: TEditablePropertyCell = {
    data: undefined,
    params: {
        values: [
            'FUTURES_PAYOUT_FUNCTION_NOTIONAL_VALUE',
            'FUTURES_PAYOUT_FUNCTION_PRICE_BY_NOTATION_VALUE',
            'FUTURES_PAYOUT_FUNCTION_NEG_RATIO_OF_NOTIONAL_TO_PRICE',
        ],
        valueFormatter: (value) =>
            instrumentPayoutFunctionToDisplayPayoutFunction(
                value as TProviderInstrumentDetailsFuturesPayoutNotationFuturesPayoutFunction,
            ),
    },
    kind: EDataKind.Select,
    editable: true,
};

const INITIAL_OVERRIDE: TOverrideProviderInstrument = {
    [EPropertyGroup.BaseProperties]: {
        [ProviderInstrumentPropertyName.BasePropertiesKind]: {
            data: undefined,
            params: {
                values: [
                    'instantSpot',
                    'spotDetails',
                    'futuresDetails',
                    'perpFutures',
                    'option',
                    'instrumentSwap',
                ],
                valueFormatter: (value) =>
                    kindToDisplayKind(
                        value as Exclude<TProviderInstrumentDetails['kind'], undefined>['type'],
                    ),
            },
            kind: EDataKind.Select,
            editable: true,
        },
    },
    [EPropertyGroup.AmountNotation]: {
        [ProviderInstrumentPropertyName.AmountNotationAssetName]: STRING_EDITOR,
        [ProviderInstrumentPropertyName.AmountNotationAssetMultiplier]: NUMBER_EDITOR,
        [ProviderInstrumentPropertyName.AmountNotationInstrumentName]: STRING_EDITOR,
        [ProviderInstrumentPropertyName.AmountNotationInstrumentMultiplier]: NUMBER_EDITOR,
        [ProviderInstrumentPropertyName.AmountNotationIndexName]: STRING_EDITOR,
        [ProviderInstrumentPropertyName.AmountNotationIndexMultiplier]: NUMBER_EDITOR,
    },
    [EPropertyGroup.PriceNotation]: {
        [ProviderInstrumentPropertyName.PriceNotationNumeratorAssetName]: STRING_EDITOR,
        [ProviderInstrumentPropertyName.PriceNotationNumeratorInstrumentName]: STRING_EDITOR,
        [ProviderInstrumentPropertyName.PriceNotationNumeratorIndexName]: STRING_EDITOR,
        [ProviderInstrumentPropertyName.PriceNotationDenominatorAssetName]: STRING_EDITOR,
        [ProviderInstrumentPropertyName.PriceNotationDenominatorInstrumentName]: STRING_EDITOR,
        [ProviderInstrumentPropertyName.PriceNotationDenominatorIndexName]: STRING_EDITOR,
        [ProviderInstrumentPropertyName.PriceNotationDenominatorMultiplier]: NUMBER_EDITOR,
    },
    [EPropertyGroup.Settlement]: {
        [ProviderInstrumentPropertyName.SettlementType]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.SettlementTime]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.SettlementAssetName]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.SettlementAssetsPerContract]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.SettlementInstrumentName]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.SettlementInstrumentsPerContract]: SKIP_EDITOR,
    },
    [EPropertyGroup.Notional]: {
        [ProviderInstrumentPropertyName.NotionalKind]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.NotionalAssetName]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.NotionalAssetsPerContract]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.NotionalInstrumentName]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.NotionalInstrumentsPerContract]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.NotionalFactor]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.NotionalNotationAssetName]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.NotionalPriceSourceInstrumentName]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.NotionalPriceSourceIndexName]: SKIP_EDITOR,
    },
    [EPropertyGroup.Underlying]: {
        [ProviderInstrumentPropertyName.UnderlyingAssetName]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.UnderlyingInstrumentName]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.UnderlyingIndexName]: SKIP_EDITOR,
    },
    [EPropertyGroup.Spot]: {
        [ProviderInstrumentPropertyName.SpotBaseAssetName]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.SpotQuoteAssetName]: SKIP_EDITOR,
    },
    [EPropertyGroup.StartExpiration]: {
        [ProviderInstrumentPropertyName.StartExpirationStartTime]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.StartExpirationExpirationTime]: SKIP_EDITOR,
    },
    [EPropertyGroup.PayoutNotation]: {
        [ProviderInstrumentPropertyName.PayoutNotationUnitAssetName]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.PayoutNotationFunction]: SKIP_EDITOR,
    },
    [EPropertyGroup.MarginNotation]: {
        [ProviderInstrumentPropertyName.MarginNotationAssetName]: SKIP_EDITOR,
    },
    [EPropertyGroup.Option]: {
        [ProviderInstrumentPropertyName.OptionCollateralizingType]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.OptionType]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.OptionStyle]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.OptionStrikePrice]: SKIP_EDITOR,
    },
    [EPropertyGroup.InstrumentSwap]: {
        [ProviderInstrumentPropertyName.InstrumentSwapBuyInstrumentName]: SKIP_EDITOR,
        [ProviderInstrumentPropertyName.InstrumentSwapSellInstrumentName]: SKIP_EDITOR,
    },
};

export function useOverride(): [
    TOverrideProviderInstrument,
    (group: EPropertyGroup, property: string, editableCell: Nil | TEditablePropertyCell) => boolean,
    VoidFunction,
] {
    const [override, setOverride] = useState(INITIAL_OVERRIDE);

    const setOverrideProperty = useFunction(
        (group: EPropertyGroup, property: string, editableCell: Nil | TEditablePropertyCell) => {
            if (isNil(override) || isNil(editableCell)) {
                return false;
            }

            setOverride(reduceOverride(override, group, property, editableCell));

            return true;
        },
    );

    const clearOverride = useFunction(() => setOverride(INITIAL_OVERRIDE));

    return [override, setOverrideProperty, clearOverride];
}

const basePropertiesReducer = combineReducers({
    [ProviderInstrumentPropertyName.BasePropertiesKind](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        return group === EPropertyGroup.BaseProperties &&
            property === ProviderInstrumentPropertyName.BasePropertiesKind
            ? editableCell
            : state;
    },
});

const amountNotationReducer = combineReducers({
    [ProviderInstrumentPropertyName.AmountNotationAssetName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group !== EPropertyGroup.AmountNotation) {
            return state;
        }

        switch (property) {
            case ProviderInstrumentPropertyName.AmountNotationAssetName:
                return editableCell;

            case ProviderInstrumentPropertyName.AmountNotationInstrumentName:
            case ProviderInstrumentPropertyName.AmountNotationInstrumentMultiplier:
            case ProviderInstrumentPropertyName.AmountNotationIndexName:
            case ProviderInstrumentPropertyName.AmountNotationIndexMultiplier:
                return STRING_EDITOR;

            default:
                return state;
        }
    },
    [ProviderInstrumentPropertyName.AmountNotationAssetMultiplier](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group !== EPropertyGroup.AmountNotation) {
            return state;
        }

        switch (property) {
            case ProviderInstrumentPropertyName.AmountNotationAssetMultiplier:
                return editableCell;

            case ProviderInstrumentPropertyName.AmountNotationInstrumentName:
            case ProviderInstrumentPropertyName.AmountNotationInstrumentMultiplier:
            case ProviderInstrumentPropertyName.AmountNotationIndexName:
            case ProviderInstrumentPropertyName.AmountNotationIndexMultiplier:
                return NUMBER_EDITOR;

            default:
                return state;
        }
    },
    [ProviderInstrumentPropertyName.AmountNotationInstrumentName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group !== EPropertyGroup.AmountNotation) {
            return state;
        }

        switch (property) {
            case ProviderInstrumentPropertyName.AmountNotationInstrumentName:
                return editableCell;

            case ProviderInstrumentPropertyName.AmountNotationAssetName:
            case ProviderInstrumentPropertyName.AmountNotationAssetMultiplier:
            case ProviderInstrumentPropertyName.AmountNotationIndexName:
            case ProviderInstrumentPropertyName.AmountNotationIndexMultiplier:
                return STRING_EDITOR;

            default:
                return state;
        }
    },
    [ProviderInstrumentPropertyName.AmountNotationInstrumentMultiplier](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group !== EPropertyGroup.AmountNotation) {
            return state;
        }

        switch (property) {
            case ProviderInstrumentPropertyName.AmountNotationInstrumentMultiplier:
                return editableCell;

            case ProviderInstrumentPropertyName.AmountNotationAssetName:
            case ProviderInstrumentPropertyName.AmountNotationAssetMultiplier:
            case ProviderInstrumentPropertyName.AmountNotationIndexName:
            case ProviderInstrumentPropertyName.AmountNotationIndexMultiplier:
                return NUMBER_EDITOR;

            default:
                return state;
        }
    },
    [ProviderInstrumentPropertyName.AmountNotationIndexName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group !== EPropertyGroup.AmountNotation) {
            return state;
        }

        switch (property) {
            case ProviderInstrumentPropertyName.AmountNotationIndexName:
                return editableCell;

            case ProviderInstrumentPropertyName.AmountNotationAssetName:
            case ProviderInstrumentPropertyName.AmountNotationAssetMultiplier:
            case ProviderInstrumentPropertyName.AmountNotationInstrumentName:
            case ProviderInstrumentPropertyName.AmountNotationInstrumentMultiplier:
                return STRING_EDITOR;

            default:
                return state;
        }
    },
    [ProviderInstrumentPropertyName.AmountNotationIndexMultiplier](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group !== EPropertyGroup.AmountNotation) {
            return state;
        }

        switch (property) {
            case ProviderInstrumentPropertyName.AmountNotationIndexMultiplier:
                return editableCell;

            case ProviderInstrumentPropertyName.AmountNotationAssetName:
            case ProviderInstrumentPropertyName.AmountNotationAssetMultiplier:
            case ProviderInstrumentPropertyName.AmountNotationInstrumentName:
            case ProviderInstrumentPropertyName.AmountNotationInstrumentMultiplier:
                return NUMBER_EDITOR;

            default:
                return state;
        }
    },
});

const priceNotationReducer = combineReducers({
    [ProviderInstrumentPropertyName.PriceNotationNumeratorAssetName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group !== EPropertyGroup.PriceNotation) {
            return state;
        }

        switch (property) {
            case ProviderInstrumentPropertyName.PriceNotationNumeratorAssetName:
                return editableCell;

            case ProviderInstrumentPropertyName.PriceNotationNumeratorInstrumentName:
            case ProviderInstrumentPropertyName.PriceNotationNumeratorIndexName:
            case ProviderInstrumentPropertyName.PriceNotationDenominatorAssetName:
            case ProviderInstrumentPropertyName.PriceNotationDenominatorInstrumentName:
            case ProviderInstrumentPropertyName.PriceNotationDenominatorIndexName:
            case ProviderInstrumentPropertyName.PriceNotationDenominatorMultiplier:
                return STRING_EDITOR;

            default:
                return state;
        }
    },
    [ProviderInstrumentPropertyName.PriceNotationNumeratorInstrumentName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group !== EPropertyGroup.PriceNotation) {
            return state;
        }

        switch (property) {
            case ProviderInstrumentPropertyName.PriceNotationNumeratorInstrumentName:
                return editableCell;

            case ProviderInstrumentPropertyName.PriceNotationNumeratorAssetName:
            case ProviderInstrumentPropertyName.PriceNotationNumeratorIndexName:
            case ProviderInstrumentPropertyName.PriceNotationDenominatorAssetName:
            case ProviderInstrumentPropertyName.PriceNotationDenominatorInstrumentName:
            case ProviderInstrumentPropertyName.PriceNotationDenominatorIndexName:
            case ProviderInstrumentPropertyName.PriceNotationDenominatorMultiplier:
                return STRING_EDITOR;

            default:
                return state;
        }
    },
    [ProviderInstrumentPropertyName.PriceNotationNumeratorIndexName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group !== EPropertyGroup.PriceNotation) {
            return state;
        }

        switch (property) {
            case ProviderInstrumentPropertyName.PriceNotationNumeratorIndexName:
                return editableCell;

            case ProviderInstrumentPropertyName.PriceNotationNumeratorAssetName:
            case ProviderInstrumentPropertyName.PriceNotationNumeratorInstrumentName:
            case ProviderInstrumentPropertyName.PriceNotationDenominatorAssetName:
            case ProviderInstrumentPropertyName.PriceNotationDenominatorInstrumentName:
            case ProviderInstrumentPropertyName.PriceNotationDenominatorIndexName:
            case ProviderInstrumentPropertyName.PriceNotationDenominatorMultiplier:
                return STRING_EDITOR;

            default:
                return state;
        }
    },
    [ProviderInstrumentPropertyName.PriceNotationDenominatorAssetName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group !== EPropertyGroup.PriceNotation) {
            return state;
        }

        switch (property) {
            case ProviderInstrumentPropertyName.PriceNotationDenominatorAssetName:
                return editableCell;

            case ProviderInstrumentPropertyName.PriceNotationNumeratorAssetName:
            case ProviderInstrumentPropertyName.PriceNotationNumeratorInstrumentName:
            case ProviderInstrumentPropertyName.PriceNotationNumeratorIndexName:
            case ProviderInstrumentPropertyName.PriceNotationDenominatorInstrumentName:
            case ProviderInstrumentPropertyName.PriceNotationDenominatorIndexName:
                return STRING_EDITOR;

            default:
                return state;
        }
    },
    [ProviderInstrumentPropertyName.PriceNotationDenominatorInstrumentName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group !== EPropertyGroup.PriceNotation) {
            return state;
        }

        switch (property) {
            case ProviderInstrumentPropertyName.PriceNotationDenominatorInstrumentName:
                return editableCell;

            case ProviderInstrumentPropertyName.PriceNotationNumeratorAssetName:
            case ProviderInstrumentPropertyName.PriceNotationNumeratorInstrumentName:
            case ProviderInstrumentPropertyName.PriceNotationNumeratorIndexName:
            case ProviderInstrumentPropertyName.PriceNotationDenominatorAssetName:
            case ProviderInstrumentPropertyName.PriceNotationDenominatorIndexName:
                return STRING_EDITOR;

            default:
                return state;
        }
    },
    [ProviderInstrumentPropertyName.PriceNotationDenominatorIndexName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group !== EPropertyGroup.PriceNotation) {
            return state;
        }

        switch (property) {
            case ProviderInstrumentPropertyName.PriceNotationDenominatorIndexName:
                return editableCell;

            case ProviderInstrumentPropertyName.PriceNotationNumeratorAssetName:
            case ProviderInstrumentPropertyName.PriceNotationNumeratorInstrumentName:
            case ProviderInstrumentPropertyName.PriceNotationNumeratorIndexName:
            case ProviderInstrumentPropertyName.PriceNotationDenominatorAssetName:
            case ProviderInstrumentPropertyName.PriceNotationDenominatorInstrumentName:
                return STRING_EDITOR;

            default:
                return state;
        }
    },
    [ProviderInstrumentPropertyName.PriceNotationDenominatorMultiplier](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group !== EPropertyGroup.PriceNotation) {
            return state;
        }

        switch (property) {
            case ProviderInstrumentPropertyName.PriceNotationDenominatorMultiplier:
                return editableCell;

            case ProviderInstrumentPropertyName.PriceNotationNumeratorAssetName:
            case ProviderInstrumentPropertyName.PriceNotationNumeratorInstrumentName:
            case ProviderInstrumentPropertyName.PriceNotationNumeratorIndexName:
                return NUMBER_EDITOR;

            default:
                return state;
        }
    },
});

const settlementReducer = combineReducers({
    [ProviderInstrumentPropertyName.SettlementType](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            if (property !== ProviderInstrumentPropertyName.BasePropertiesKind) {
                return state;
            }

            return isString(editableCell.data) && hasInstrumentSettlement(editableCell.data)
                ? SETTLEMENT_TYPE_OVERRIDE
                : SKIP_EDITOR;
        }

        return group === EPropertyGroup.Settlement &&
            property === ProviderInstrumentPropertyName.SettlementType
            ? editableCell
            : state;
    },
    [ProviderInstrumentPropertyName.SettlementTime](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            if (property !== ProviderInstrumentPropertyName.BasePropertiesKind) {
                return state;
            }

            return isString(editableCell.data) && hasInstrumentSettlement(editableCell.data)
                ? DATETIME_EDITOR
                : SKIP_EDITOR;
        }

        if (group === EPropertyGroup.Option) {
            if (property !== ProviderInstrumentPropertyName.OptionStyle) {
                return state;
            }

            return editableCell.data === 'american' ? DATETIME_EDITOR : state;
        }

        return group === EPropertyGroup.Settlement &&
            property === ProviderInstrumentPropertyName.SettlementTime
            ? editableCell
            : state;
    },
    [ProviderInstrumentPropertyName.SettlementAssetName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            return property === ProviderInstrumentPropertyName.BasePropertiesKind
                ? SKIP_EDITOR
                : state;
        }

        if (group === EPropertyGroup.Settlement) {
            switch (property) {
                case ProviderInstrumentPropertyName.SettlementType:
                    return editableCell.data === 'financiallySettled' ||
                        editableCell.data === 'physicallyDelivered'
                        ? STRING_EDITOR
                        : SKIP_EDITOR;
                case ProviderInstrumentPropertyName.SettlementAssetName:
                    return editableCell;
            }
        }

        return state;
    },
    [ProviderInstrumentPropertyName.SettlementAssetsPerContract](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            return property === ProviderInstrumentPropertyName.BasePropertiesKind
                ? SKIP_EDITOR
                : state;
        }

        if (group === EPropertyGroup.Settlement) {
            switch (property) {
                case ProviderInstrumentPropertyName.SettlementType:
                    return editableCell.data === 'physicallyDelivered'
                        ? NUMBER_EDITOR
                        : SKIP_EDITOR;
                case ProviderInstrumentPropertyName.SettlementAssetsPerContract:
                    return editableCell;
            }
        }

        return state;
    },
    [ProviderInstrumentPropertyName.SettlementInstrumentName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            return property === ProviderInstrumentPropertyName.BasePropertiesKind
                ? SKIP_EDITOR
                : state;
        }

        if (group === EPropertyGroup.Settlement) {
            switch (property) {
                case ProviderInstrumentPropertyName.SettlementType:
                    return editableCell.data === 'exercisesIntoInstrument'
                        ? STRING_EDITOR
                        : SKIP_EDITOR;
                case ProviderInstrumentPropertyName.SettlementInstrumentName:
                    return editableCell;
            }
        }

        return state;
    },
    [ProviderInstrumentPropertyName.SettlementInstrumentsPerContract](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            return property === ProviderInstrumentPropertyName.BasePropertiesKind
                ? SKIP_EDITOR
                : state;
        }

        if (group === EPropertyGroup.Settlement) {
            switch (property) {
                case ProviderInstrumentPropertyName.SettlementType:
                    return editableCell.data === 'exercisesIntoInstrument'
                        ? NUMBER_EDITOR
                        : SKIP_EDITOR;
                case ProviderInstrumentPropertyName.SettlementInstrumentsPerContract:
                    return editableCell;
            }
        }

        return state;
    },
});

const notionalReducer = combineReducers({
    [ProviderInstrumentPropertyName.NotionalKind](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            if (property !== ProviderInstrumentPropertyName.BasePropertiesKind) {
                return state;
            }

            return isString(editableCell.data) && hasInstrumentNotional(editableCell.data)
                ? NOTIONAL_KIND_OVERRIDE
                : SKIP_EDITOR;
        }

        return group === EPropertyGroup.Notional &&
            property === ProviderInstrumentPropertyName.NotionalKind
            ? editableCell
            : state;
    },
    [ProviderInstrumentPropertyName.NotionalAssetName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            return property === ProviderInstrumentPropertyName.BasePropertiesKind
                ? SKIP_EDITOR
                : state;
        }

        if (group === EPropertyGroup.Notional) {
            switch (property) {
                case ProviderInstrumentPropertyName.NotionalKind:
                    return editableCell.data === 'asset' ? STRING_EDITOR : SKIP_EDITOR;
                case ProviderInstrumentPropertyName.NotionalAssetName:
                    return editableCell;
            }
        }

        return state;
    },
    [ProviderInstrumentPropertyName.NotionalAssetsPerContract](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            return property === ProviderInstrumentPropertyName.BasePropertiesKind
                ? SKIP_EDITOR
                : state;
        }

        if (group === EPropertyGroup.Notional) {
            switch (property) {
                case ProviderInstrumentPropertyName.NotionalKind:
                    return editableCell.data === 'asset' ? NUMBER_EDITOR : SKIP_EDITOR;
                case ProviderInstrumentPropertyName.NotionalAssetsPerContract:
                    return editableCell;
            }
        }

        return state;
    },
    [ProviderInstrumentPropertyName.NotionalInstrumentName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            return property === ProviderInstrumentPropertyName.BasePropertiesKind
                ? SKIP_EDITOR
                : state;
        }

        if (group === EPropertyGroup.Notional) {
            switch (property) {
                case ProviderInstrumentPropertyName.NotionalKind:
                    return editableCell.data === 'instrument' ? STRING_EDITOR : SKIP_EDITOR;
                case ProviderInstrumentPropertyName.NotionalInstrumentName:
                    return editableCell;
            }
        }

        return state;
    },
    [ProviderInstrumentPropertyName.NotionalInstrumentsPerContract](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            return property === ProviderInstrumentPropertyName.BasePropertiesKind
                ? SKIP_EDITOR
                : state;
        }

        if (group === EPropertyGroup.Notional) {
            switch (property) {
                case ProviderInstrumentPropertyName.NotionalKind:
                    return editableCell.data === 'instrument' ? NUMBER_EDITOR : SKIP_EDITOR;
                case ProviderInstrumentPropertyName.NotionalInstrumentsPerContract:
                    return editableCell;
            }
        }

        return state;
    },
    [ProviderInstrumentPropertyName.NotionalFactor](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            return property === ProviderInstrumentPropertyName.BasePropertiesKind
                ? SKIP_EDITOR
                : state;
        }

        if (group === EPropertyGroup.Notional) {
            switch (property) {
                case ProviderInstrumentPropertyName.NotionalKind:
                    return editableCell.data === 'priceProportional' ? NUMBER_EDITOR : SKIP_EDITOR;
                case ProviderInstrumentPropertyName.NotionalFactor:
                    return editableCell;
            }
        }

        return state;
    },
    [ProviderInstrumentPropertyName.NotionalFactor](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            return property === ProviderInstrumentPropertyName.BasePropertiesKind
                ? SKIP_EDITOR
                : state;
        }

        if (group === EPropertyGroup.Notional) {
            switch (property) {
                case ProviderInstrumentPropertyName.NotionalKind:
                    return editableCell.data === 'priceProportional' ? NUMBER_EDITOR : SKIP_EDITOR;
                case ProviderInstrumentPropertyName.NotionalFactor:
                    return editableCell;
            }
        }

        return state;
    },
    [ProviderInstrumentPropertyName.NotionalNotationAssetName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            return property === ProviderInstrumentPropertyName.BasePropertiesKind
                ? SKIP_EDITOR
                : state;
        }

        if (group === EPropertyGroup.Notional) {
            switch (property) {
                case ProviderInstrumentPropertyName.NotionalKind:
                    return editableCell.data === 'priceProportional' ? STRING_EDITOR : SKIP_EDITOR;
                case ProviderInstrumentPropertyName.NotionalNotationAssetName:
                    return editableCell;
            }
        }

        return state;
    },
    [ProviderInstrumentPropertyName.NotionalPriceSourceInstrumentName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            return property === ProviderInstrumentPropertyName.BasePropertiesKind
                ? SKIP_EDITOR
                : state;
        }

        if (group === EPropertyGroup.Notional) {
            switch (property) {
                case ProviderInstrumentPropertyName.NotionalKind:
                    return editableCell.data === 'priceProportional' ? STRING_EDITOR : SKIP_EDITOR;
                case ProviderInstrumentPropertyName.NotionalPriceSourceInstrumentName:
                    return editableCell;
                case ProviderInstrumentPropertyName.NotionalPriceSourceIndexName:
                    return STRING_EDITOR;
            }
        }

        return state;
    },
    [ProviderInstrumentPropertyName.NotionalPriceSourceIndexName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            return property === ProviderInstrumentPropertyName.BasePropertiesKind
                ? SKIP_EDITOR
                : state;
        }

        if (group === EPropertyGroup.Notional) {
            switch (property) {
                case ProviderInstrumentPropertyName.NotionalKind:
                    return editableCell.data === 'priceProportional' ? STRING_EDITOR : SKIP_EDITOR;
                case ProviderInstrumentPropertyName.NotionalPriceSourceIndexName:
                    return editableCell;
                case ProviderInstrumentPropertyName.NotionalPriceSourceInstrumentName:
                    return STRING_EDITOR;
            }
        }

        return state;
    },
});

const underlyingReducer = combineReducers({
    [ProviderInstrumentPropertyName.UnderlyingAssetName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            if (property !== ProviderInstrumentPropertyName.BasePropertiesKind) {
                return state;
            }

            return isString(editableCell.data) && hasInstrumentUnderlying(editableCell.data)
                ? STRING_EDITOR
                : SKIP_EDITOR;
        }
        if (group !== EPropertyGroup.Underlying) {
            return state;
        }

        switch (property) {
            case ProviderInstrumentPropertyName.UnderlyingAssetName:
                return editableCell;
            case ProviderInstrumentPropertyName.UnderlyingInstrumentName:
            case ProviderInstrumentPropertyName.UnderlyingIndexName:
                return STRING_EDITOR;
            default:
                return state;
        }
    },
    [ProviderInstrumentPropertyName.UnderlyingInstrumentName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            if (property !== ProviderInstrumentPropertyName.BasePropertiesKind) {
                return state;
            }

            return isString(editableCell.data) && hasInstrumentUnderlying(editableCell.data)
                ? STRING_EDITOR
                : SKIP_EDITOR;
        }
        if (group !== EPropertyGroup.Underlying) {
            return state;
        }

        switch (property) {
            case ProviderInstrumentPropertyName.UnderlyingInstrumentName:
                return editableCell;
            case ProviderInstrumentPropertyName.UnderlyingAssetName:
            case ProviderInstrumentPropertyName.UnderlyingIndexName:
                return STRING_EDITOR;
            default:
                return state;
        }
    },
    [ProviderInstrumentPropertyName.UnderlyingIndexName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            if (property !== ProviderInstrumentPropertyName.BasePropertiesKind) {
                return state;
            }

            return isString(editableCell.data) && hasInstrumentUnderlying(editableCell.data)
                ? STRING_EDITOR
                : SKIP_EDITOR;
        }
        if (group !== EPropertyGroup.Underlying) {
            return state;
        }

        switch (property) {
            case ProviderInstrumentPropertyName.UnderlyingIndexName:
                return editableCell;
            case ProviderInstrumentPropertyName.UnderlyingAssetName:
            case ProviderInstrumentPropertyName.UnderlyingInstrumentName:
                return STRING_EDITOR;
            default:
                return state;
        }
    },
});

const spotReducer = combineReducers({
    [ProviderInstrumentPropertyName.SpotBaseAssetName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            if (property !== ProviderInstrumentPropertyName.BasePropertiesKind) {
                return state;
            }

            return isString(editableCell.data) && hasInstrumentSpotData(editableCell.data)
                ? STRING_EDITOR
                : SKIP_EDITOR;
        }

        return group === EPropertyGroup.Spot &&
            property === ProviderInstrumentPropertyName.SpotBaseAssetName
            ? editableCell
            : state;
    },
    [ProviderInstrumentPropertyName.SpotQuoteAssetName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            if (property !== ProviderInstrumentPropertyName.BasePropertiesKind) {
                return state;
            }

            return isString(editableCell.data) && hasInstrumentSpotData(editableCell.data)
                ? STRING_EDITOR
                : SKIP_EDITOR;
        }

        return group === EPropertyGroup.Spot &&
            property === ProviderInstrumentPropertyName.SpotQuoteAssetName
            ? editableCell
            : state;
    },
});

const startExpirationReducer = combineReducers({
    [ProviderInstrumentPropertyName.StartExpirationStartTime](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            if (property !== ProviderInstrumentPropertyName.BasePropertiesKind) {
                return state;
            }

            return isString(editableCell.data) && hasInstrumentStartExpiration(editableCell.data)
                ? DATETIME_EDITOR
                : SKIP_EDITOR;
        }

        return group === EPropertyGroup.StartExpiration &&
            property === ProviderInstrumentPropertyName.StartExpirationStartTime
            ? editableCell
            : state;
    },
    [ProviderInstrumentPropertyName.StartExpirationExpirationTime](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            if (property !== ProviderInstrumentPropertyName.BasePropertiesKind) {
                return state;
            }

            return isString(editableCell.data) && hasInstrumentStartExpiration(editableCell.data)
                ? DATETIME_EDITOR
                : SKIP_EDITOR;
        }

        return group === EPropertyGroup.StartExpiration &&
            property === ProviderInstrumentPropertyName.StartExpirationExpirationTime
            ? editableCell
            : state;
    },
});

const payoutNotationReducer = combineReducers({
    [ProviderInstrumentPropertyName.PayoutNotationUnitAssetName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            if (property !== ProviderInstrumentPropertyName.BasePropertiesKind) {
                return state;
            }

            return isString(editableCell.data) && hasInstrumentPayoutNotation(editableCell.data)
                ? STRING_EDITOR
                : SKIP_EDITOR;
        }

        return group === EPropertyGroup.PayoutNotation &&
            property === ProviderInstrumentPropertyName.PayoutNotationUnitAssetName
            ? editableCell
            : state;
    },
    [ProviderInstrumentPropertyName.PayoutNotationFunction](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            if (property !== ProviderInstrumentPropertyName.BasePropertiesKind) {
                return state;
            }

            return isString(editableCell.data) && hasInstrumentPayoutNotation(editableCell.data)
                ? PAYOUT_NOTATION_FUNCTION_OVERRIDE
                : SKIP_EDITOR;
        }

        return group === EPropertyGroup.PayoutNotation &&
            property === ProviderInstrumentPropertyName.PayoutNotationFunction
            ? editableCell
            : state;
    },
});

const marginNotationReducer = combineReducers({
    [ProviderInstrumentPropertyName.MarginNotationAssetName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            if (property !== ProviderInstrumentPropertyName.BasePropertiesKind) {
                return state;
            }

            return isString(editableCell.data) && hasInstrumentMarginNotation(editableCell.data)
                ? STRING_EDITOR
                : SKIP_EDITOR;
        }

        return group === EPropertyGroup.MarginNotation &&
            property === ProviderInstrumentPropertyName.MarginNotationAssetName
            ? editableCell
            : state;
    },
});

const optionReducer = combineReducers({
    [ProviderInstrumentPropertyName.OptionCollateralizingType](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            if (property !== ProviderInstrumentPropertyName.BasePropertiesKind) {
                return state;
            }

            return editableCell.data === 'option'
                ? OPTION_COLLATERALIZING_TYPE_OVERRIDE
                : SKIP_EDITOR;
        }

        return group === EPropertyGroup.Option &&
            property === ProviderInstrumentPropertyName.OptionCollateralizingType
            ? editableCell
            : state;
    },
    [ProviderInstrumentPropertyName.OptionType](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            if (property !== ProviderInstrumentPropertyName.BasePropertiesKind) {
                return state;
            }

            return editableCell.data === 'option' ? OPTION_TYPE_OVERRIDE : SKIP_EDITOR;
        }

        return group === EPropertyGroup.Option &&
            property === ProviderInstrumentPropertyName.OptionType
            ? editableCell
            : state;
    },
    [ProviderInstrumentPropertyName.OptionStyle](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            if (property !== ProviderInstrumentPropertyName.BasePropertiesKind) {
                return state;
            }

            return editableCell.data === 'option' ? OPTION_STYLE_OVERRIDE : SKIP_EDITOR;
        }

        if (group === EPropertyGroup.Settlement) {
            if (property !== ProviderInstrumentPropertyName.SettlementTime || !state.editable) {
                return state;
            }

            return isNil(editableCell.data)
                ? state
                : {
                      ...OPTION_STYLE_OVERRIDE,
                      data: 'european',
                  };
        }

        return group === EPropertyGroup.Option &&
            property === ProviderInstrumentPropertyName.OptionStyle
            ? editableCell
            : state;
    },
    [ProviderInstrumentPropertyName.OptionStrikePrice](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            if (property !== ProviderInstrumentPropertyName.BasePropertiesKind) {
                return state;
            }

            return editableCell.data === 'option' ? NUMBER_EDITOR : SKIP_EDITOR;
        }

        return group === EPropertyGroup.Option &&
            property === ProviderInstrumentPropertyName.OptionStrikePrice
            ? editableCell
            : state;
    },
});

const instrumentSwapReducer = combineReducers({
    [ProviderInstrumentPropertyName.InstrumentSwapBuyInstrumentName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            if (property !== ProviderInstrumentPropertyName.BasePropertiesKind) {
                return state;
            }

            return editableCell.data === 'instrumentSwap' ? STRING_EDITOR : SKIP_EDITOR;
        }

        return group === EPropertyGroup.InstrumentSwap &&
            property === ProviderInstrumentPropertyName.InstrumentSwapBuyInstrumentName
            ? editableCell
            : state;
    },
    [ProviderInstrumentPropertyName.InstrumentSwapSellInstrumentName](
        state: TEditablePropertyCell,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) {
        if (group === EPropertyGroup.BaseProperties) {
            if (property !== ProviderInstrumentPropertyName.BasePropertiesKind) {
                return state;
            }

            return editableCell.data === 'instrumentSwap' ? STRING_EDITOR : SKIP_EDITOR;
        }

        return group === EPropertyGroup.InstrumentSwap &&
            property === ProviderInstrumentPropertyName.InstrumentSwapSellInstrumentName
            ? editableCell
            : state;
    },
});

const rootOverrideReducer = combineReducers({
    [EPropertyGroup.BaseProperties]: basePropertiesReducer,
    [EPropertyGroup.AmountNotation]: amountNotationReducer,
    [EPropertyGroup.PriceNotation]: priceNotationReducer,
    [EPropertyGroup.Settlement]: settlementReducer,
    [EPropertyGroup.Notional]: notionalReducer,
    [EPropertyGroup.Underlying]: underlyingReducer,
    [EPropertyGroup.Spot]: spotReducer,
    [EPropertyGroup.StartExpiration]: startExpirationReducer,
    [EPropertyGroup.PayoutNotation]: payoutNotationReducer,
    [EPropertyGroup.MarginNotation]: marginNotationReducer,
    [EPropertyGroup.Option]: optionReducer,
    [EPropertyGroup.InstrumentSwap]: instrumentSwapReducer,
});

function reduceOverride(
    override: TOverrideProviderInstrument,
    group: EPropertyGroup,
    property: string,
    editableCell: TEditablePropertyCell,
): TOverrideProviderInstrument {
    return rootOverrideReducer(
        override as ReturnType<typeof rootOverrideReducer>,
        group,
        property,
        editableCell,
    ) as TOverrideProviderInstrument;
}

type TReducer<TState> = (
    state: TState,
    group: EPropertyGroup,
    property: string,
    editableCell: TEditablePropertyCell,
) => TState;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TStateFromReducersMapObject<M> = M[keyof M] extends TReducer<any> | undefined
    ? {
          [P in keyof M]: M[P] extends TReducer<infer S> ? S : never;
      }
    : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function combineReducers<M extends Record<string, TReducer<any>>>(
    reducers: M,
): (
    state: TStateFromReducersMapObject<M>,
    group: EPropertyGroup,
    property: string,
    editableCell: TEditablePropertyCell,
) => TStateFromReducersMapObject<M> {
    return (
        state: TStateFromReducersMapObject<M>,
        group: EPropertyGroup,
        property: string,
        editableCell: TEditablePropertyCell,
    ) =>
        mapValues(reducers, (reducer, key) =>
            reducer(state[key], group, property, editableCell),
        ) as TStateFromReducersMapObject<M>;
}
