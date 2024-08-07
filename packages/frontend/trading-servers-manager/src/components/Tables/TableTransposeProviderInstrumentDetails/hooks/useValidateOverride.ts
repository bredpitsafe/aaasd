import type {
    TProviderInstrumentDetailsNotional,
    TProviderInstrumentDetailsOptionStyle,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ISO } from '@common/types';
import { assertNever } from '@common/utils/src/assert.ts';
import { hasInstrumentNotional } from '@frontend/common/src/utils/instruments/hasInstrumentNotional.ts';
import { hasInstrumentPayoutNotation } from '@frontend/common/src/utils/instruments/hasInstrumentPayoutNotation.ts';
import { hasInstrumentSettlement } from '@frontend/common/src/utils/instruments/hasInstrumentSettlement.ts';
import { hasInstrumentUnderlying } from '@frontend/common/src/utils/instruments/hasInstrumentUnderlying.ts';
import { every, isEmpty, isNil, isString } from 'lodash-es';
import { useMemo } from 'react';

import type { TOverrideProviderInstrument } from '../../defs.ts';
import { EPropertyGroup, ProviderInstrumentPropertyName } from '../../defs.ts';
import type { TOverrideError } from '../defs.ts';

export function useValidateOverride(override: TOverrideProviderInstrument): TOverrideError[] {
    return useMemo(() => {
        if (
            every<TOverrideProviderInstrument>(override, (group) =>
                every(group, (cell) => isNil(cell) || !cell.editable || isNil(cell.data)),
            )
        ) {
            return [{ group: undefined, property: undefined, error: 'Empty override' }];
        }

        return validate(override);
    }, [override]);
}

function validateCollisions(
    group: EPropertyGroup,
    fields: (string[] | string)[],
): TOverrideError[] {
    const result: TOverrideError[] = [];

    if (fields.length > 1) {
        fields.forEach((collisionField) =>
            (Array.isArray(collisionField) ? collisionField : [collisionField]).forEach(
                (collisionField) =>
                    result.push({
                        group,
                        property: collisionField,
                        error: `"${collisionField}" is in conflict with ${fields
                            .filter((field) =>
                                Array.isArray(field)
                                    ? !field.includes(collisionField)
                                    : field !== collisionField,
                            )
                            .map((field) =>
                                Array.isArray(field)
                                    ? `{${field.map((field) => `"${field}"`).join(', ')}}`
                                    : `"${field}"`,
                            )
                            .join(', ')}`,
                    }),
            ),
        );
    }

    return result;
}

function validateAmountNotation(override: TOverrideProviderInstrument): TOverrideError[] {
    const amountNotationOverride = override[EPropertyGroup.AmountNotation];

    const filledField: string[] = [];
    if (
        !isEmpty(
            amountNotationOverride?.[ProviderInstrumentPropertyName.AmountNotationAssetName].data,
        )
    ) {
        filledField.push(ProviderInstrumentPropertyName.AmountNotationAssetName);
    }
    if (
        !isEmpty(
            amountNotationOverride?.[ProviderInstrumentPropertyName.AmountNotationInstrumentName]
                .data,
        )
    ) {
        filledField.push(ProviderInstrumentPropertyName.AmountNotationInstrumentName);
    }
    if (
        !isEmpty(
            amountNotationOverride?.[ProviderInstrumentPropertyName.AmountNotationIndexName].data,
        )
    ) {
        filledField.push(ProviderInstrumentPropertyName.AmountNotationIndexName);
    }

    return validateCollisions(EPropertyGroup.AmountNotation, filledField);
}

function validatePriceNotation(override: TOverrideProviderInstrument): TOverrideError[] {
    const priceNotationOverride = override[EPropertyGroup.PriceNotation];

    const filledNumeratorField: string[] = [];
    if (
        !isEmpty(
            priceNotationOverride?.[ProviderInstrumentPropertyName.PriceNotationNumeratorAssetName]
                .data,
        )
    ) {
        filledNumeratorField.push(ProviderInstrumentPropertyName.PriceNotationNumeratorAssetName);
    }
    if (
        !isEmpty(
            priceNotationOverride?.[
                ProviderInstrumentPropertyName.PriceNotationNumeratorInstrumentName
            ].data,
        )
    ) {
        filledNumeratorField.push(
            ProviderInstrumentPropertyName.PriceNotationNumeratorInstrumentName,
        );
    }
    if (
        !isEmpty(
            priceNotationOverride?.[ProviderInstrumentPropertyName.PriceNotationNumeratorIndexName]
                .data,
        )
    ) {
        filledNumeratorField.push(ProviderInstrumentPropertyName.PriceNotationNumeratorIndexName);
    }

    const filledDenominatorField: string[] = [];
    if (
        !isEmpty(
            priceNotationOverride?.[
                ProviderInstrumentPropertyName.PriceNotationDenominatorAssetName
            ].data,
        )
    ) {
        filledDenominatorField.push(
            ProviderInstrumentPropertyName.PriceNotationDenominatorAssetName,
        );
    }
    if (
        !isEmpty(
            priceNotationOverride?.[
                ProviderInstrumentPropertyName.PriceNotationDenominatorInstrumentName
            ].data,
        )
    ) {
        filledDenominatorField.push(
            ProviderInstrumentPropertyName.PriceNotationDenominatorInstrumentName,
        );
    }
    if (
        !isEmpty(
            priceNotationOverride?.[
                ProviderInstrumentPropertyName.PriceNotationDenominatorIndexName
            ].data,
        )
    ) {
        filledDenominatorField.push(
            ProviderInstrumentPropertyName.PriceNotationDenominatorIndexName,
        );
    }

    return [
        ...validateCollisions(EPropertyGroup.PriceNotation, filledNumeratorField),
        ...validateCollisions(EPropertyGroup.PriceNotation, filledDenominatorField),
    ];
}

function validateSettlement(override: TOverrideProviderInstrument): TOverrideError[] {
    const kind =
        override[EPropertyGroup.BaseProperties]?.[ProviderInstrumentPropertyName.BasePropertiesKind]
            ?.data;

    if (!isString(kind) || !hasInstrumentSettlement(kind)) {
        return [];
    }

    switch (kind) {
        case 'option': {
            const date = override[EPropertyGroup.Settlement]?.[
                ProviderInstrumentPropertyName.SettlementTime
            ]?.data as ISO | undefined;
            const style = override[EPropertyGroup.Option]?.[
                ProviderInstrumentPropertyName.OptionStyle
            ]?.data as
                | undefined
                | Exclude<TProviderInstrumentDetailsOptionStyle['value'], undefined>['type'];

            return isNil(date) || style === 'european'
                ? []
                : [
                      {
                          group: EPropertyGroup.Option,
                          property: ProviderInstrumentPropertyName.OptionStyle,
                          error: `"${ProviderInstrumentPropertyName.OptionStyle}" should be european`,
                      },
                      {
                          group: EPropertyGroup.Settlement,
                          property: ProviderInstrumentPropertyName.SettlementTime,
                          error: `"${
                              ProviderInstrumentPropertyName.SettlementTime
                          }" should be empty for ${
                              isEmpty(style) ? 'empty' : `"${style}"`
                          } settlement style`,
                      },
                  ];
        }
        case 'futuresDetails':
        case 'spotDetails':
            return [];
        default:
            assertNever(kind);
    }
}

function notionalSettlement(override: TOverrideProviderInstrument): TOverrideError[] {
    const kind =
        override[EPropertyGroup.BaseProperties]?.[ProviderInstrumentPropertyName.BasePropertiesKind]
            ?.data;

    if (!isString(kind) || !hasInstrumentNotional(kind)) {
        return [];
    }

    const notionalOverride = override[EPropertyGroup.Notional];

    const notionalKind = notionalOverride?.[ProviderInstrumentPropertyName.NotionalKind].data as
        | Exclude<TProviderInstrumentDetailsNotional['value'], undefined>['type']
        | undefined;

    if (isNil(notionalKind)) {
        return [];
    }

    const errors: TOverrideError[] = [];

    switch (notionalKind) {
        case 'asset': {
            if (
                isEmpty(notionalOverride?.[ProviderInstrumentPropertyName.NotionalAssetName].data)
            ) {
                errors.push({
                    group: EPropertyGroup.Notional,
                    property: ProviderInstrumentPropertyName.NotionalAssetName,
                    error: `"${ProviderInstrumentPropertyName.NotionalAssetName}" can't be empty`,
                });
            }
            if (
                isNil(
                    notionalOverride?.[ProviderInstrumentPropertyName.NotionalAssetsPerContract]
                        .data,
                )
            ) {
                errors.push({
                    group: EPropertyGroup.Notional,
                    property: ProviderInstrumentPropertyName.NotionalAssetsPerContract,
                    error: `"${ProviderInstrumentPropertyName.NotionalAssetsPerContract}" can't be empty`,
                });
            }
            break;
        }
        case 'instrument': {
            if (
                isEmpty(
                    notionalOverride?.[ProviderInstrumentPropertyName.NotionalInstrumentName].data,
                )
            ) {
                errors.push({
                    group: EPropertyGroup.Notional,
                    property: ProviderInstrumentPropertyName.NotionalInstrumentName,
                    error: `"${ProviderInstrumentPropertyName.NotionalInstrumentName}" can't be empty`,
                });
            }
            if (
                isNil(
                    notionalOverride?.[
                        ProviderInstrumentPropertyName.NotionalInstrumentsPerContract
                    ].data,
                )
            ) {
                errors.push({
                    group: EPropertyGroup.Notional,
                    property: ProviderInstrumentPropertyName.NotionalInstrumentsPerContract,
                    error: `"${ProviderInstrumentPropertyName.NotionalInstrumentsPerContract}" can't be empty`,
                });
            }
            break;
        }
        case 'priceProportional': {
            if (isNil(notionalOverride?.[ProviderInstrumentPropertyName.NotionalFactor].data)) {
                errors.push({
                    group: EPropertyGroup.Notional,
                    property: ProviderInstrumentPropertyName.NotionalFactor,
                    error: `"${ProviderInstrumentPropertyName.NotionalFactor}" can't be empty`,
                });
            }
            if (
                isEmpty(
                    notionalOverride?.[ProviderInstrumentPropertyName.NotionalNotationAssetName]
                        .data,
                )
            ) {
                errors.push({
                    group: EPropertyGroup.Notional,
                    property: ProviderInstrumentPropertyName.NotionalNotationAssetName,
                    error: `"${ProviderInstrumentPropertyName.NotionalNotationAssetName}" can't be empty`,
                });
            }
            break;
        }
    }

    const priceSourceField: string[] = [];
    if (
        !isEmpty(
            notionalOverride?.[ProviderInstrumentPropertyName.NotionalPriceSourceInstrumentName]
                .data,
        )
    ) {
        priceSourceField.push(ProviderInstrumentPropertyName.NotionalPriceSourceInstrumentName);
    }
    if (
        !isEmpty(
            notionalOverride?.[ProviderInstrumentPropertyName.NotionalPriceSourceIndexName].data,
        )
    ) {
        priceSourceField.push(ProviderInstrumentPropertyName.NotionalPriceSourceIndexName);
    }

    return [...errors, ...validateCollisions(EPropertyGroup.Notional, priceSourceField)];
}

function validateUnderlying(override: TOverrideProviderInstrument): TOverrideError[] {
    const kind =
        override[EPropertyGroup.BaseProperties]?.[ProviderInstrumentPropertyName.BasePropertiesKind]
            ?.data;

    if (!isString(kind) || !hasInstrumentUnderlying(kind)) {
        return [];
    }

    const underlyingOverride = override[EPropertyGroup.Underlying];

    const field: string[] = [];
    if (!isEmpty(underlyingOverride?.[ProviderInstrumentPropertyName.UnderlyingAssetName].data)) {
        field.push(ProviderInstrumentPropertyName.UnderlyingAssetName);
    }
    if (
        !isEmpty(underlyingOverride?.[ProviderInstrumentPropertyName.UnderlyingInstrumentName].data)
    ) {
        field.push(ProviderInstrumentPropertyName.UnderlyingInstrumentName);
    }
    if (!isEmpty(underlyingOverride?.[ProviderInstrumentPropertyName.UnderlyingIndexName].data)) {
        field.push(ProviderInstrumentPropertyName.UnderlyingIndexName);
    }

    return validateCollisions(EPropertyGroup.Underlying, field);
}

function validatePayoutNotation(override: TOverrideProviderInstrument): TOverrideError[] {
    const kind =
        override[EPropertyGroup.BaseProperties]?.[ProviderInstrumentPropertyName.BasePropertiesKind]
            ?.data;

    if (!isString(kind) || !hasInstrumentPayoutNotation(kind)) {
        return [];
    }

    const payoutNotationOverride = override[EPropertyGroup.PayoutNotation];

    if (
        !isEmpty(
            payoutNotationOverride?.[ProviderInstrumentPropertyName.PayoutNotationUnitAssetName]
                ?.data,
        ) &&
        isNil(payoutNotationOverride?.[ProviderInstrumentPropertyName.PayoutNotationFunction]?.data)
    ) {
        return [
            {
                group: EPropertyGroup.PayoutNotation,
                property: ProviderInstrumentPropertyName.PayoutNotationFunction,
                error: `"${ProviderInstrumentPropertyName}" should not be empty if "${ProviderInstrumentPropertyName.PayoutNotationUnitAssetName}" is set`,
            },
        ];
    }

    return [];
}

function validateKind(override: TOverrideProviderInstrument): TOverrideError[] {
    const kind =
        override[EPropertyGroup.BaseProperties]?.[ProviderInstrumentPropertyName.BasePropertiesKind]
            ?.data;

    if (isEmpty(kind)) {
        return [];
    }

    if (
        every<TOverrideProviderInstrument>(
            override,
            (group, key) =>
                [
                    EPropertyGroup.BaseProperties,
                    EPropertyGroup.AmountNotation,
                    EPropertyGroup.PriceNotation,
                ].includes(key as EPropertyGroup) ||
                every(group, (cell) => isNil(cell) || !cell.editable || isNil(cell.data)),
        )
    ) {
        return [
            {
                group: EPropertyGroup.BaseProperties,
                property: ProviderInstrumentPropertyName.BasePropertiesKind,
                error: 'Override Kind is not empty but extended properties are not set',
            },
        ];
    }

    return [];
}

function validate(override: TOverrideProviderInstrument): TOverrideError[] {
    return [
        ...validateAmountNotation(override),
        ...validatePriceNotation(override),
        ...validateKind(override),
        ...validateSettlement(override),
        ...notionalSettlement(override),
        ...validatePriceNotation(override),
        ...validateUnderlying(override),
        ...validatePayoutNotation(override),
    ];
}
