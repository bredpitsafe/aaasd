import type { TInstrument } from '@backend/bff/src/modules/instruments/schemas/defs';
import type { ISO } from '@common/types';
import type { ColDef, RowClassParams, RowClassRules } from '@frontend/ag-grid';
import { getInstrumentMarginNotation } from '@frontend/common/src/utils/instruments/getInstrumentMarginNotation.ts';
import { getInstrumentNotional } from '@frontend/common/src/utils/instruments/getInstrumentNotional.ts';
import { getInstrumentPayoutNotation } from '@frontend/common/src/utils/instruments/getInstrumentPayoutNotation.ts';
import { getInstrumentSettlementTime } from '@frontend/common/src/utils/instruments/getinstrumentSettlementTime.ts';
import { getInstrumentSettlementType } from '@frontend/common/src/utils/instruments/getInstrumentSettlementType.ts';
import { getInstrumentSpotData } from '@frontend/common/src/utils/instruments/getInstrumentSpotData.ts';
import { getInstrumentStartExpiration } from '@frontend/common/src/utils/instruments/getInstrumentStartExpiration.ts';
import { getInstrumentUnderlying } from '@frontend/common/src/utils/instruments/getInstrumentUnderlying.ts';
import { isNil, isString } from 'lodash-es';

import type {
    EPropertyGroup,
    TFullInstrument,
    TPackedFullInstrument,
    TPropertyCell,
    TPropertyRow,
} from '../defs';
import { cnGroup } from './styles.css.ts';

export const ROW_CLASS_RULES: RowClassRules<TPropertyRow> = {
    [cnGroup]: ({ node }: RowClassParams<TPropertyRow>) => isString(node.key),
};

export function getPackedInstrumentColumnsNames(fullInstruments: TFullInstrument[]): {
    id: number;
    name: string;
    field: ColDef<TPropertyRow>['field'];
}[] {
    return fullInstruments.map(({ id, name }) => ({
        id,
        name,
        field: `indicator-id-${id}`,
    }));
}

export function packFullInstrument(fullInstrument: TFullInstrument): TPackedFullInstrument {
    const settlementType = getInstrumentSettlementType(fullInstrument);
    const settlementTime = getInstrumentSettlementTime(fullInstrument);
    const startExpiration = getInstrumentStartExpiration(fullInstrument);
    const spotData = getInstrumentSpotData(fullInstrument);

    return {
        instrument: fullInstrument as TInstrument,
        id: fullInstrument.id,
        name: fullInstrument.name,
        kind: fullInstrument.kind?.type,
        exchange: fullInstrument.exchange,
        approvalStatus: fullInstrument.approvalStatus,
        status: fullInstrument.status,
        minPrice: fullInstrument.minPrice,
        maxPrice: fullInstrument.maxPrice,
        minQty: fullInstrument.minQty,
        maxQty: fullInstrument.maxQty,
        minVolume: fullInstrument.minVolume,
        priceStepRules: fullInstrument.priceStepRules,
        amountStepRules: fullInstrument.amountStepRules,
        amountNotation: fullInstrument.amountNotation,
        priceNotation: fullInstrument.priceNotation,
        settlement:
            isNil(settlementType) && isNil(settlementTime)
                ? undefined
                : { type: settlementType, time: settlementTime },
        notional: getInstrumentNotional(fullInstrument),
        underlying: getInstrumentUnderlying(fullInstrument),
        baseAssetId: spotData?.baseAssetId,
        quoteAssetId: spotData?.quoteAssetId,
        startTime: startExpiration?.startTime,
        expirationTime: startExpiration?.expirationTime,
        payoutNotation: getInstrumentPayoutNotation(fullInstrument),
        marginNotation: getInstrumentMarginNotation(fullInstrument),
        option: fullInstrument.kind?.type === 'option' ? fullInstrument.kind.option : undefined,
        instrumentSwap:
            fullInstrument.kind?.type === 'instrumentSwap'
                ? fullInstrument.kind.instrumentSwap
                : undefined,
        user: fullInstrument.user,
        platformTime: fullInstrument.platformTime as ISO,
    };
}

export function getInstrumentsRow(
    group: EPropertyGroup,
    property: string,
    items: TPackedFullInstrument[],
    getter: (item: TPackedFullInstrument) => TPropertyCell,
): TPropertyRow {
    return items.reduce(
        (acc, item) => {
            acc[`indicator-id-${item.id}`] = getter(item);
            return acc;
        },
        { group, property } as TPropertyRow,
    );
}
