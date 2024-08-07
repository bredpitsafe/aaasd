import { DEFAULT_CURRENCY_SYMBOL } from '@frontend/common/src/types/domain/currency';
import { ESide } from '@frontend/common/src/types/domain/task';
import { tryTransformToSymbol } from '@frontend/common/src/utils/domain/currency';
import { isNil, isNumber } from 'lodash-es';

import type { THerodotusTask, THerodotusTaskInstrument } from '../types/domain';
import { isV2HeroProtocolTask } from './isV2HeroProtocol';

export function shouldUseUSD(task: THerodotusTask): boolean {
    return (
        (task.buyInstruments?.every((inst) => isNumber(inst.filledAmountUsd)) ?? true) &&
        (task.sellInstruments?.every((inst) => isNumber(inst.filledAmountUsd)) ?? true)
    );
}

export function getComputationCurrency(useUsd: boolean, priceCurrency: string): string {
    return useUsd ? DEFAULT_CURRENCY_SYMBOL : tryTransformToSymbol(priceCurrency);
}

/* Calculate average price for a single instrument in asset currency */
export function getInstrumentAveragePrice(inst: THerodotusTaskInstrument): number | null {
    return inst.filledAmountBase > 0 ? inst.cumulativeQuote / inst.filledAmountBase : null;
}

/* Calculate average price for a single instrument in USD */
export function getInstrumentAveragePriceUsd(inst: THerodotusTaskInstrument): number | null {
    return getInstrumentsAveragePrice([inst], 'filledAmountUsd');
}

/* Calculate total trade volumes for all instruments both in asset currency and USD */
function sumField(
    instruments: THerodotusTaskInstrument[],
    field: keyof Pick<
        THerodotusTaskInstrument,
        'cumulativeQuote' | 'filledAmountUsd' | 'filledAmountBase'
    >,
) {
    return instruments.reduce((acc, inst) => acc + (inst[field] ?? 0), 0);
}

/* Calculate average trade price for all instruments in USD */
function getInstrumentsAveragePriceUsd(instruments: THerodotusTaskInstrument[]): null | number {
    return getInstrumentsAveragePrice(instruments, 'filledAmountUsd');
}

/* Calculate average trade price for all instruments in USD or in quote currency */
function getInstrumentsAveragePrice(
    instruments: THerodotusTaskInstrument[],
    field: keyof Pick<THerodotusTaskInstrument, 'cumulativeQuote' | 'filledAmountUsd'>,
): null | number {
    const filledAmount = sumField(instruments, field);
    const filledAmountBase = sumField(instruments, 'filledAmountBase');

    if (filledAmount === 0 || filledAmountBase === 0) {
        return null;
    }

    return filledAmount / filledAmountBase;
}

/* Calculate average price for all instruments in USD only for Buy and Sell tasks. */
export function getAveragePriceUsd(
    type: ESide,
    buyInstruments: THerodotusTaskInstrument[] | null,
    sellInstruments: THerodotusTaskInstrument[] | null,
): null | number {
    switch (type) {
        case ESide.Buy: {
            if (buyInstruments === null) {
                return null;
            }
            return getInstrumentsAveragePriceUsd(buyInstruments);
        }
        case ESide.Sell: {
            if (sellInstruments === null) {
                return null;
            }
            return getInstrumentsAveragePriceUsd(sellInstruments);
        }
        default: {
            return null;
        }
    }
}

/* Calculate realized premium percent only for BuySell tasks. */
export function getRealizedPremium(
    type: ESide,
    buyInstruments: null | THerodotusTaskInstrument[],
    sellInstruments: null | THerodotusTaskInstrument[],
    useUsd: boolean,
): null | number {
    if (type !== ESide.BuySell || buyInstruments === null || sellInstruments === null) {
        return null;
    }

    const buyAverage = useUsd
        ? getInstrumentsAveragePriceUsd(buyInstruments)
        : getInstrumentsAveragePrice(buyInstruments, 'cumulativeQuote');
    const sellAverage = useUsd
        ? getInstrumentsAveragePriceUsd(sellInstruments)
        : getInstrumentsAveragePrice(sellInstruments, 'cumulativeQuote');

    if (buyAverage === null || sellAverage === null || sellAverage === 0) {
        return null;
    }

    return 100 * (buyAverage / sellAverage - 1.0);
}

function getInstrumentsVolume(
    instruments: null | THerodotusTaskInstrument[],
    field: keyof Pick<THerodotusTaskInstrument, 'filledAmountUsd' | 'cumulativeQuote'>,
): null | number {
    return instruments === null ? null : sumField(instruments, field);
}

/* Calculate total `filled amount` (aka `volume`) for all instruments.
   Depending on task type it'll return either a single number (Buy, Sell) or 2 numbers (BuySell) */
export function getTaskVolume(
    useUsd: boolean,
    buyInstruments: THerodotusTaskInstrument[] | null,
    sellInstruments: THerodotusTaskInstrument[] | null,
): { buyVolume: number | null; sellVolume: number | null } {
    const field = useUsd ? 'filledAmountUsd' : 'cumulativeQuote';
    const buyVolume = getInstrumentsVolume(buyInstruments, field);
    const sellVolume = getInstrumentsVolume(sellInstruments, field);

    return { sellVolume, buyVolume };
}

export function getExportFilename(name: string, params: Record<string, string>): string {
    return `${name}__${Object.keys(params)
        .map((key) => `[${key} ${params[key]}]`)
        .join('_')}`;
}

export function getTaskProgress(task: THerodotusTask) {
    const amount = isV2HeroProtocolTask(task)
        ? task.amount
        : task.amount?.Base ?? task.amount?.Usd ?? null;
    return isNil(task.filledAmount) || isNil(amount) ? null : (task.filledAmount / amount) * 100;
}
