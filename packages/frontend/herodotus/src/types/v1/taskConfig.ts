import type { TExchange } from '@frontend/common/src/types/domain/exchange';
import type { TInstrument } from '@frontend/common/src/types/domain/instrument';
import type { ESide } from '@frontend/common/src/types/domain/task';

import type { EAmountType, EHerodotusTaskRole } from '../domain';
import type { THerodotusAccountV1 } from './account';

export type THerodotusConfigV1 = {
    taskType: ESide;
    asset: string; // какую монету покупаем
    amount: Partial<Record<EAmountType, number>>;
    buyInstruments?: THerodotusConfigInstrumentV1[]; // какие инструменты используем
    sellInstruments?: THerodotusConfigInstrumentV1[]; // какие инструменты используем
    orderSize: number; // Размер одной опкупки
    priceLimit?: null | number; // максимально допустимая цена покупки.
    priceLimitInQuoteCurrency?: null | number; // только для Buy/Sell
    maxPremium?: null | number; // максимальное отклонение инструмента для BuySell.
    aggression: number; // агрессивность покупки.
    // Задается в %цены, отшагиваемых от того же края стакана.
    // Положительные числа - сдвиг в агрессивную сторону, отрицательные - сдвиг вглубь стакана.
};

export type THerodotusConfigInstrumentV1 = {
    role: EHerodotusTaskRole;
    name: TInstrument['name'];
    exchange: TExchange['name'];
    account: THerodotusAccountV1['name'];
    aggression?: number;
    class?: string | null;
};
