import type { TInstrument } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ISO } from '@common/types';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { matchValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEmpty, isNil, isNumber } from 'lodash-es';
import { useMemo } from 'react';

import type { TInstrumentWithRevisions, TPackedProviderInstrument } from '../../defs.ts';
import { packProviderInstruments } from '../../utils/instruments.ts';

export function usePackedProviderInstruments(
    instrumentIds: TInstrumentWithRevisions[],
    instrumentsDesc: TValueDescriptor2<
        ReadonlyMap<number, { instrument: TInstrument; platformTime?: ISO }[]>
    >,
): undefined | { instrument: TInstrument; providerInstruments: TPackedProviderInstrument[] }[] {
    return useMemo(
        () =>
            matchValueDescriptor(instrumentsDesc, {
                unsynced() {
                    return undefined;
                },
                synced({ value: instrumentsMap }) {
                    if (isEmpty(instrumentIds)) {
                        return EMPTY_ARRAY;
                    }

                    const result: {
                        instrument: TInstrument;
                        providerInstruments: TPackedProviderInstrument[];
                    }[] = [];

                    for (const complexInstrumentId of instrumentIds) {
                        const instrumentId = isNumber(complexInstrumentId)
                            ? complexInstrumentId
                            : complexInstrumentId.instrumentId;

                        const instrumentRevs = instrumentsMap.get(instrumentId);

                        if (isNil(instrumentRevs)) {
                            continue;
                        }

                        const instrument = getInstrument(instrumentRevs);

                        if (isNil(instrument)) {
                            continue;
                        }

                        const revPlatformTimes = isNumber(complexInstrumentId)
                            ? [undefined]
                            : complexInstrumentId.platformTime;

                        const providerInstruments: TPackedProviderInstrument[] = [];

                        for (const revPlatformTime of revPlatformTimes) {
                            const revInstrument = getInstrument(instrumentRevs, revPlatformTime);

                            if (isNil(revInstrument)) {
                                continue;
                            }

                            packProviderInstruments(revInstrument, isNil(revPlatformTime)).forEach(
                                (providerInstrument) =>
                                    providerInstruments.push(providerInstrument),
                            );
                        }

                        if (providerInstruments.length === 0) {
                            continue;
                        }

                        result.push({ instrument, providerInstruments });
                    }

                    return result.length === 0 ? EMPTY_ARRAY : result;
                },
            }),
        [instrumentIds, instrumentsDesc],
    );
}

function getInstrument(
    instrumentRevs: { instrument: TInstrument; platformTime?: ISO | undefined }[],
    platformTime?: ISO,
): undefined | TInstrument {
    return instrumentRevs.find(
        ({ platformTime: revPlatformTime }) => revPlatformTime === platformTime,
    )?.instrument;
}
