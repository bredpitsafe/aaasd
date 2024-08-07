import type { EExchangeName } from '@frontend/common/src/types/domain/exchange';

import type { THerodotusTaskInstrumentView } from '../types';
import type { THerodotusTaskInstrument } from '../types/domain';
import type { THerodotusTaskInstrumentV2 } from '../types/v2/task';
import { isV2HeroProtocolInstrument } from './isV2HeroProtocol';

const INSTRUMENT_NAME_SEPARATOR = '|';
export function getFullInstrumentName(
    inst: THerodotusTaskInstrument,
): THerodotusTaskInstrumentView['fullName'] {
    if (isV2HeroProtocolInstrument(inst)) {
        // `inst.instrument` has {name}|{exchange} structure`,
        // but view should be {exchange}|{account}{name} instead.
        // We should parse & reorder here to match previous view structure.
        const { name, exchange, account } = getInstrumentDetailsV2(inst);
        return `${exchange} | ${account} | ${name}`;
    }
    return `${inst.exchange} | ${inst.account} | ${inst.name}`;
}
export function getInstrumentDetailsV2(inst: THerodotusTaskInstrumentV2): {
    name: string;
    exchange: EExchangeName;
    account: string;
} {
    const [name, exchange] = inst.instrument.split(INSTRUMENT_NAME_SEPARATOR);
    return { name, exchange: exchange as EExchangeName, account: inst.virtualAccount };
}

export function getInstrumentKey(
    inst: THerodotusTaskInstrument,
    side: THerodotusTaskInstrumentView['side'],
): string {
    return `${side} | ${getFullInstrumentName(inst)}`;
}
