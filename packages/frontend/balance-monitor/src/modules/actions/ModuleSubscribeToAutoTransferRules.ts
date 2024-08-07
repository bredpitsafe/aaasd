import type { TSubscriptionEvent } from '@common/rx';
import { createUpdateEvent, isSubscriptionEventSubscribed } from '@common/rx';
import type { ISO } from '@common/types';
import type { TSubscribed } from '@frontend/common/src/modules/actions/def.ts';
import { convertToSubscriptionEventValueDescriptor } from '@frontend/common/src/modules/actions/utils.ts';
import type { TUserName } from '@frontend/common/src/modules/user/domain';
import type {
    TAutoTransferRuleInfo,
    TRuleId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { pipe } from 'rxjs';

import type { TCoinSelectorRaw, TEmptySendBody, TRuleVertexRaw } from './defs';
import { convertToClientRuleCoin, convertToClientRuleVertex } from './utils';

type TUpsertBody = { type: 'AutoTransferRuleApplied' } & TAutoTransferRuleInfo;

type TDeleteBody = { type: 'AutoTransferRuleDeleted'; id: TRuleId };

type TReceiveBody = TSubscribed | TUpsertBody | TDeleteBody;

type TReceiveBodyRaw =
    | {
          type: 'AutoTransferRuleApplied';

          id: TRuleId;
          coin: TCoinSelectorRaw;
          source: TRuleVertexRaw;
          destination: TRuleVertexRaw;
          note?: string;
          withOpposite: boolean;

          enableAuto: boolean;
          rulePriority: number;
          doNotOverride: boolean;

          username: TUserName;
          createTime: ISO;
          updateTime: ISO;
      }
    | TDeleteBody;

const descriptor = createRemoteProcedureDescriptor<TEmptySendBody, TReceiveBodyRaw>()(
    EPlatformSocketRemoteProcedureName.SubscribeToAutoTransferRules,
    ERemoteProcedureType.Subscribe,
);

export const ModuleSubscribeToAutoTransferRules = createRemoteProcedureCall(descriptor)({
    getPipe: () =>
        pipe(
            convertToSubscriptionEventValueDescriptor((payload) => payload),
            mapValueDescriptor((vd): TValueDescriptor2<TSubscriptionEvent<TReceiveBody>> => {
                if (
                    isSubscriptionEventSubscribed(vd.value) ||
                    vd.value.payload.type !== 'AutoTransferRuleApplied'
                ) {
                    return vd as TValueDescriptor2<TSubscriptionEvent<TReceiveBody>>;
                }

                const { coin, source, destination, ...payload } = vd.value.payload;

                return createSyncedValueDescriptor(
                    createUpdateEvent({
                        ...payload,
                        username: vd.value.payload.username,
                        coinsMatchRule: convertToClientRuleCoin(coin),
                        source: convertToClientRuleVertex(source),
                        destination: convertToClientRuleVertex(destination),
                    }),
                );
            }),
        ),
});
