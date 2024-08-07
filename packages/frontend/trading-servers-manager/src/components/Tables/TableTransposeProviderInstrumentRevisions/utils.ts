import type { TInstrument } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ISO } from '@common/types';
import type { RowClassParams, RowClassRules } from '@frontend/ag-grid';
import { isNil, isNumber, isString } from 'lodash-es';

import type {
    EPropertyGroup,
    TInstrumentWithRevisions,
    TPackedProviderInstrument,
    TPropertyRevisionCell,
    TRevisionProviderPropertyRow,
} from '../defs';
import { isRevisionPropertyCellEqual } from '../utils/instruments.ts';
import { cnGroup } from './styles.css.ts';

export const ROW_CLASS_RULES: RowClassRules<TRevisionProviderPropertyRow> = {
    [cnGroup]: ({ node }: RowClassParams<TRevisionProviderPropertyRow>) => isString(node.key),
};

export function getProviderInstrumentsRow(
    group: EPropertyGroup,
    property: string,
    items: {
        instrument: TInstrument;
        providerInstruments: TPackedProviderInstrument[];
    }[],
    getter: (item: TPackedProviderInstrument) => Omit<TPropertyRevisionCell, 'hasDiff'>,
    revisionInstrumentsIds: TInstrumentWithRevisions[],
): TRevisionProviderPropertyRow {
    const columnsDescriptors = items
        .map(
            ({
                instrument,
                providerInstruments,
            }): {
                key: Exclude<keyof TRevisionProviderPropertyRow, 'group' | 'property' | 'hasDiff'>;
                cell: Omit<TPropertyRevisionCell, 'hasDiff'>;
                id: number;
            }[] =>
                providerInstruments
                    .filter(({ latest, platformInstrument: { id, platformTime } }) => {
                        const revision = latest ? undefined : (platformTime as ISO);

                        return revisionInstrumentsIds.some((complexId) =>
                            isNumber(complexId)
                                ? complexId === id && isNil(revision)
                                : complexId.instrumentId === id &&
                                  (complexId.platformTime as (ISO | undefined)[]).includes(
                                      revision,
                                  ),
                        );
                    })
                    .map((providerInstrument) => ({
                        key: `indicator-name-${providerInstrument.name}-rev-${
                            providerInstrument.latest
                                ? 'latest'
                                : (providerInstrument.platformInstrument.platformTime as ISO)
                        }-provider-${providerInstrument.provider}-rev-${
                            providerInstrument.platformTime
                        }`,
                        cell: getter(providerInstrument),
                        id: instrument.id,
                    })),
        )
        .flat();

    const lastValue = new Map<number, Omit<TPropertyRevisionCell, 'hasDiff'>>();
    const hasDiff = new Set<number>();

    for (const { id, cell } of columnsDescriptors) {
        const existingCell = lastValue.get(id);

        if (isNil(existingCell)) {
            lastValue.set(id, cell);
        } else if (
            !hasDiff.has(id) &&
            !isRevisionPropertyCellEqual(
                existingCell as TPropertyRevisionCell,
                cell as TPropertyRevisionCell,
            )
        ) {
            hasDiff.add(id);
        }
    }

    const columns = columnsDescriptors.reduce(
        (acc, { id, key, cell }) => {
            acc[key] = { ...cell, hasDiff: hasDiff.has(id) } as TPropertyRevisionCell;
            return acc;
        },
        {} as Omit<TRevisionProviderPropertyRow, 'group' | 'property' | 'hasDiff'>,
    );

    return { group, property, hasDiff: hasDiff.size > 0, ...columns };
}
