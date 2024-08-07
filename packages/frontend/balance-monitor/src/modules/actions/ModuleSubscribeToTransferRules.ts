import type { TSubscriptionEvent } from '@common/rx';
import { createUpdateEvent, isSubscriptionEventUpdate } from '@common/rx';
import type { ISO } from '@common/types';
import type { TSubscribed } from '@frontend/common/src/modules/actions/def.ts';
import { convertToSubscriptionEventValueDescriptor } from '@frontend/common/src/modules/actions/utils.ts';
import type { TUserName } from '@frontend/common/src/modules/user';
import type {
    ERuleActualStatus,
    TRuleId,
    TTransferBlockingRuleInfo,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { ERuleGroups } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { identity } from '@frontend/common/src/utils/identity.ts';
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

type TUpsertBody = { type: 'TransferRuleApplied' } & TTransferBlockingRuleInfo;

type TDeleteBody = { type: 'TransferRuleDeleted'; id: TRuleId };

type TReceiveBody =
    | TSubscribed
    | {
          type: 'TransferRuleApplied';

          id: TRuleId;
          coin: TCoinSelectorRaw;
          source: TRuleVertexRaw;
          destination: TRuleVertexRaw;
          note?: string;
          withOpposite: boolean;
          showAlert: boolean;

          actualStatus: ERuleActualStatus;
          disableManual: boolean;
          disableSuggest: boolean;
          since?: ISO;
          until?: ISO;

          username: TUserName;
          createTime: ISO;
          updateTime: ISO;
      }
    | TDeleteBody;

const descriptor = createRemoteProcedureDescriptor<TEmptySendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToTransferRules,
    ERemoteProcedureType.Subscribe,
);

export const ModuleSubscribeToTransferRules = createRemoteProcedureCall(descriptor)({
    getPipe: () =>
        pipe(
            convertToSubscriptionEventValueDescriptor(identity),
            mapValueDescriptor(
                (vd): TValueDescriptor2<TSubscriptionEvent<TUpsertBody | TDeleteBody>> => {
                    const { value } = vd;

                    if (
                        isSubscriptionEventUpdate(value) &&
                        value.payload.type === 'TransferRuleApplied'
                    ) {
                        const {
                            disableManual,
                            disableSuggest,
                            coin,
                            source,
                            destination,
                            ...payload
                        } = value.payload;

                        return createSyncedValueDescriptor(
                            createUpdateEvent({
                                ...payload,
                                coinsMatchRule: convertToClientRuleCoin(coin),
                                source: convertToClientRuleVertex(source),
                                destination: convertToClientRuleVertex(destination),
                                disabledGroups: convertDisabledGroupsFlagsToEnum(
                                    disableManual,
                                    disableSuggest,
                                ),
                            }),
                        );
                    }

                    return vd as TValueDescriptor2<TSubscriptionEvent<TDeleteBody>>;
                },
            ),
        ),
});

function convertDisabledGroupsFlagsToEnum(
    disableManual: boolean,
    disableSuggest: boolean,
): ERuleGroups {
    if (disableManual && disableSuggest) {
        return ERuleGroups.All;
    }

    if (!disableManual && !disableSuggest) {
        return ERuleGroups.None;
    }

    return disableManual ? ERuleGroups.Manual : ERuleGroups.Suggest;
}
