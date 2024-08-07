import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '@common/rpc';
import { isDeepObjectEmpty } from '@common/utils/src/comporators/isDeepObjectEmpty.ts';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables.ts';
import type { EInstrumentStatus, TInstrument } from '../../../types/domain/instrument.ts';
import { getExchangeLinkByName } from '../../../utils/exchangeLinks/getExchangeLinkByName.ts';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '../../../utils/semanticHash.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';

export type TInstrumentsDictionaryParams = {
    filters?: {
        statuses?: EInstrumentStatus[];
        nameRegexes?: string[];
    };
};

type TSendBody = TInstrumentsDictionaryParams;

type TReceiveBody = { instruments: TInstrument[] };

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.ListInstrumentsV2,
    ERemoteProcedureType.Request,
);

export const ModuleFetchInstruments = createRemoteProcedureCall(descriptor)({
    getPipe: () => {
        return mapValueDescriptor(({ value }) =>
            createSyncedValueDescriptor(
                value.payload.instruments.map((instrument) => ({
                    ...instrument,
                    href: getExchangeLinkByName(instrument)?.href ?? null,
                })),
            ),
        );
    },
    dedobs: {
        normalize: ([params]) =>
            semanticHash.get(params, {
                target: semanticHash.withHasher(getSocketUrlHash),
                filters: {
                    ...semanticHash.withNullable(isDeepObjectEmpty),
                    ...semanticHash.withHasher<TInstrumentsDictionaryParams['filters']>((filters) =>
                        semanticHash.get(filters, {
                            statuses: semanticHash.withSorter(null),
                            nameRegexes: semanticHash.withSorter(null),
                        }),
                    ),
                },
            }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});
