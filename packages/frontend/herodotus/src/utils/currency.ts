import type { TInstrument } from '@frontend/common/src/types/domain/instrument';

import type { THerodotusTaskFormDataInstrument } from '../types';

export function getFirstQuoteCurrencyName(
    instruments: TInstrument[],
    dataInstruments: THerodotusTaskFormDataInstrument[],
): undefined | string {
    const name = dataInstruments.find(({ name }) => name !== undefined)?.name;

    if (name === undefined) return undefined;

    const instrument = instruments.find((inst) => inst.name === name);

    if (instrument === undefined) return undefined;

    return 'quoteCurrencyName' in instrument.kind ? instrument.kind.quoteCurrencyName : undefined;
}

export function hasCommonQuoteCurrency(
    instruments: TInstrument[],
    dataInstruments: THerodotusTaskFormDataInstrument[],
): boolean {
    const firstName = getFirstQuoteCurrencyName(instruments, dataInstruments);

    return firstName === undefined
        ? false
        : dataInstruments
              .filter(({ name }) => name !== undefined)
              .every(({ name }) => {
                  const instrument = instruments.find((inst) => inst.name === name);

                  if (instrument === undefined) return false;

                  return (
                      'quoteCurrencyName' in instrument.kind &&
                      firstName === instrument.kind.quoteCurrencyName
                  );
              });
}
