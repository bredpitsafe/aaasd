import type {
    FetchConvertRatesSnapshotRequest,
    FetchConvertRatesSnapshotResponse,
} from '@bhft/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';
import { RequiredDeep } from 'type-fest';

import { WithRequestStage } from '../../../def/stages.ts';
import { Assign, InterfaceToType } from '../../../def/types.ts';

export type TFetchConvertRatesSnapshotRequestPayload = InterfaceToType<
    WithRequestStage<
        Assign<
            FetchConvertRatesSnapshotRequest,
            {
                type: 'FetchConvertRatesSnapshot';
            }
        >
    >
>;

export type TFetchConvertRatesSnapshotResponsePayload = InterfaceToType<
    Assign<
        RequiredDeep<FetchConvertRatesSnapshotResponse>,
        {
            type: 'ConvertRatesSnapshot';
        }
    >
>;
