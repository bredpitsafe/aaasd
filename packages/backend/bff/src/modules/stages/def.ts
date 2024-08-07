import type { TRpcApi } from '../../def/rpc.ts';
import type {
    TSubscribeToStagesRequestPayload,
    TSubscribeToStagesResponsePayload,
} from './schemas/SubscribeToStages.schema.ts';

export enum EStagesRouteName {
    SubscribeToStages = 'SubscribeToStages',
}

export type TStagesRoutesMap = {
    [EStagesRouteName.SubscribeToStages]: TRpcApi<
        TSubscribeToStagesRequestPayload,
        TSubscribeToStagesResponsePayload
    >;
};
