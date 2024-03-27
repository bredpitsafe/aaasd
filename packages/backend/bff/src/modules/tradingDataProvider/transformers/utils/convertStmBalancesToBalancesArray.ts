import { StmBalance } from '@bhft/trading_data_provider-api-sdk/services/trading_data_provider/v1/stm_api.js';
import { omit } from 'lodash-es';

import { TStmBalance } from '../../schemas/SubscribeToStmBalances.schema.ts';

export const convertStmBalancesToBalancesArray = (balances?: StmBalance[]): TStmBalance[] =>
    balances?.map((update) => omit(update, 'position')) ?? [];
