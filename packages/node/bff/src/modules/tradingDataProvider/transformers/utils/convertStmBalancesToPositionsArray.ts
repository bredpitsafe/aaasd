import { StmBalance } from '@bhft/trading_data_provider-api-sdk/services/trading_data_provider/v1/stm_api.js';
import { omit } from 'lodash-es';

import { TStmPosition } from '../../schemas/SubscribeToStmPositions.schema.ts';

export const convertStmBalancesToPositionsArray = (balances?: StmBalance[]): TStmPosition[] =>
    balances?.map((update) => omit(update, 'balances')) ?? [];
