import { StmBalance } from '@bhft/trading_data_provider-api-sdk/services/trading_data_provider/v1/stm_api.js';

import { TStmBalance } from '../../schemas/SubscribeToStmBalances.schema.ts';

export const convertStmBalancesToBalancesArray = (balances?: StmBalance[]): TStmBalance[] =>
    balances?.reduce((acc, update) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { balances, position, ...rest } = update;
        balances?.forEach((balance) => {
            const resultBalance: TStmBalance = { ...rest, ...balance };
            acc.push(resultBalance);
        });

        return acc;
    }, [] as TStmBalance[]) ?? [];
