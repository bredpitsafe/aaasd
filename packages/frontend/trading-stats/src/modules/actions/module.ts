import { ModuleFactory, TContextRef } from '@frontend/common/src/di';

import { fetchOwnTrades } from './fetchOwnTrades';
import { subscribeTradingStatsDaily, subscribeTradingStatsMonthly } from './index';
import { subscribeToDailyStats } from './subscribeToDailyStats';
import { subscribeToMonthlyStats } from './subscribeToMonthlyStats';
import { subscribeToOwnTradesUpdates } from './subscribeToOwnTradesUpdates';

function createModule(ctx: TContextRef) {
    return {
        // Daily trading stats
        subscribeToDailyStats: subscribeToDailyStats.bind(null, ctx),
        subscribeTradingStatsDaily: subscribeTradingStatsDaily.bind(null, ctx),
        subscribeToOwnTradesUpdates: subscribeToOwnTradesUpdates.bind(null, ctx),
        fetchOwnTrades: fetchOwnTrades.bind(null, ctx),
        // Monthly trading stats
        subscribeToMonthlyStats: subscribeToMonthlyStats.bind(null, ctx),
        subscribeTradingStatsMonthly: subscribeTradingStatsMonthly.bind(null, ctx),
    };
}

export const ModuleTradingStatsActions = ModuleFactory(createModule);
