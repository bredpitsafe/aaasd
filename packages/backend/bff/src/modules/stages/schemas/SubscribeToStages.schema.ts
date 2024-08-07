import type { EApplicationName } from '@common/types';

import type { TStageName } from '../../../def/stages.ts';
import type { TSubscriptionResponse } from '../../../utils/subscription.ts';

export type TSubscribeToStagesRequestPayload = {
    type: 'SubscribeToStages';
    filters: {
        appName: EApplicationName;
    };
};

export type TStageExternalConfig = {
    name: TStageName;
    isProduction: boolean;
    isBacktesting: boolean;
    socket: string;
    skipAuthentication: boolean;
};

export type TSubscribeToStagesResponsePayload = TSubscriptionResponse<
    TStageExternalConfig,
    TStageExternalConfig
>;
