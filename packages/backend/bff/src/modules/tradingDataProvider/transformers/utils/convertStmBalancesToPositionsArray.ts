import type { TStmBalance } from '@grpc-schemas/trading_data_provider-api-sdk/services/trading_data_provider/v1/stm_api.js';
import { omit } from 'lodash-es';

import type { TStmPosition } from '../../schemas/SubscribeToStmPositions.schema.ts';

export const convertStmBalancesToPositionsArray = (balances?: TStmBalance[]): TStmPosition[] =>
    balances?.map((update) => omit(update, 'balances')) ?? [];
