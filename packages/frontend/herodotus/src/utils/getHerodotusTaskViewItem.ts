import { DEFAULT_CURRENCY_SYMBOL } from '@frontend/common/src/types/domain/currency';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import { ESide } from '@frontend/common/src/types/domain/task';

import type { THerodotusTaskInstrumentView, THerodotusTaskView } from '../types';
import { EHerodotusProtocolVersion } from '../types';
import type { THerodotusTask, THerodotusTaskInstrument } from '../types/domain';
import { getDashboardName } from './getDashboardName';
import { getFullInstrumentName, getInstrumentDetailsV2, getInstrumentKey } from './getItem';
import {
    getAveragePriceUsd,
    getComputationCurrency,
    getInstrumentAveragePrice,
    getInstrumentAveragePriceUsd,
    getRealizedPremium,
    getTaskProgress,
    getTaskVolume,
    shouldUseUSD,
} from './index';
import { isV2HeroProtocolInstrument, isV2HeroProtocolTask } from './isV2HeroProtocol';

export function getHerodotusTaskViewItem(
    task: THerodotusTask,
    robotId: TRobotId,
): THerodotusTaskView {
    const useUsd = shouldUseUSD(task);
    const avgPriceUsd = getAveragePriceUsd(
        task.taskType,
        task.buyInstruments,
        task.sellInstruments,
    );

    const { buyVolume, sellVolume } = getTaskVolume(
        useUsd,
        task.buyInstruments,
        task.sellInstruments,
    );

    const computationCurrency = getComputationCurrency(useUsd, task.priceCurrency);
    const isUSDComputationCurrency = computationCurrency === DEFAULT_CURRENCY_SYMBOL;

    return {
        ...task,
        robotId,
        priceLimitView:
            task.taskType === ESide.BuySell
                ? null
                : task.priceLimit ?? task.priceLimitInQuoteCurrency,
        computationCurrency,
        isUSDComputationCurrency: computationCurrency === DEFAULT_CURRENCY_SYMBOL,
        avgPriceUsd: getAveragePriceUsd(task.taskType, task.buyInstruments, task.sellInstruments),
        avgPriceView: useUsd ? avgPriceUsd : task.avgPrice,
        realizedPremium: getRealizedPremium(
            task.taskType,
            task.buyInstruments,
            task.sellInstruments,
            useUsd,
        ),
        progress: getTaskProgress(task),
        amountView: isV2HeroProtocolTask(task)
            ? task.amount
            : task.amount?.Base ?? task.amount?.Usd ?? null,
        buyVolume,
        sellVolume,
        buyInstruments:
            task.buyInstruments?.map((inst) =>
                mapInstrumentToView(
                    task,
                    inst,
                    ESide.Buy,
                    useUsd,
                    computationCurrency,
                    isUSDComputationCurrency,
                ),
            ) ?? null,
        sellInstruments:
            task.sellInstruments?.map((inst) =>
                mapInstrumentToView(
                    task,
                    inst,
                    ESide.Sell,
                    useUsd,
                    computationCurrency,
                    isUSDComputationCurrency,
                ),
            ) ?? null,
        protocol: isV2HeroProtocolTask(task)
            ? EHerodotusProtocolVersion.V2
            : EHerodotusProtocolVersion.V1,
        dashboardName: getDashboardName(task),
    };
}

function mapInstrumentToView(
    task: THerodotusTask,
    inst: THerodotusTaskInstrument,
    side: ESide.Buy | ESide.Sell,
    useUsd: boolean,
    computationCurrency: string,
    isUSDComputationCurrency: boolean,
): THerodotusTaskInstrumentView {
    const details = isV2HeroProtocolInstrument(inst) ? getInstrumentDetailsV2(inst) : inst;

    return {
        ...inst,
        key: getInstrumentKey(inst, side),
        side,
        fullName: getFullInstrumentName(inst),
        avgPrice: getInstrumentAveragePrice(inst),
        avgPriceUsd: getInstrumentAveragePriceUsd(inst),
        taskId: task.taskId,
        taskType: task.taskType,
        taskStatus: task.status,
        computationCurrency,
        isUSDComputationCurrency,
        volume: useUsd ? inst.filledAmountUsd : inst.cumulativeQuote,
        protocol: isV2HeroProtocolInstrument(inst)
            ? EHerodotusProtocolVersion.V2
            : EHerodotusProtocolVersion.V1,

        account: details.account,
        exchange: details.exchange,
        name: details.name,
    };
}
