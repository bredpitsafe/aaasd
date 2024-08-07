import memoize from 'memoizee';

import type { TInstrument } from '../../types/domain/instrument';

export const getInstrumentByName = memoize(
    (
        instruments: TInstrument[],
        exchangeName: TInstrument['exchange'] | undefined,
        instName: TInstrument['name'] | undefined,
    ) => {
        if (!instName || !exchangeName) {
            return undefined;
        }

        return instruments.find(
            (instr) => instr.exchange === exchangeName && instr.name === instName,
        );
    },
    { max: 100 },
);
