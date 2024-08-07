import type { TStmBalance as TStmBalanceSDK } from '@grpc-schemas/trading_data_provider-api-sdk/services/trading_data_provider/v1/stm_api.js';
import { omit } from 'lodash-es';

import type { TStmBalance } from '../../schemas/SubscribeToStmBalances.schema.ts';

export const convertStmBalancesToBalancesArray = (balances?: TStmBalanceSDK[]): TStmBalance[] =>
    balances?.map((update) => omit(update, 'position')) ?? [];
