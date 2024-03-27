import { map } from 'rxjs/operators';

import type { TSubscribed } from '../../../handlers/def';
import {
    ERuleActualStatus,
    ERuleGroups,
    TRuleId,
    TTransferBlockingRuleInfo,
} from '../../../types/domain/balanceMonitor/defs';
import type { ISO } from '../../../types/time';
import { ServerStreamResourceModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';
import type { TUserName } from '../../user';
import type { TCoinSelectorRaw, TEmptySendBody, TRuleVertexRaw } from './defs';
import { convertToClientRuleCoin, convertToClientRuleVertex } from './utils';

type TUpsertBody = { type: 'TransferRuleApplied' } & TTransferBlockingRuleInfo;

type TDeleteBody = { type: 'TransferRuleDeleted'; id: TRuleId };

type TReceiveBody = TSubscribed | TUpsertBody | TDeleteBody;

type TReceiveBodyRaw =
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

export const ModuleSubscribeToTransferRulesHandler = ServerStreamResourceModuleFactory<
    TEmptySendBody,
    TReceiveBodyRaw
>('SubscribeToTransferRules', { skipAuthentication: false })(() => ({
    extendPipe(resource) {
        return resource.pipe(
            map((envelope) => {
                if (envelope.payload.type === 'TransferRuleApplied') {
                    const {
                        payload: {
                            disableManual,
                            disableSuggest,
                            coin,
                            source,
                            destination,
                            ...payload
                        },
                    } = envelope;

                    return {
                        ...payload,
                        coinsMatchRule: convertToClientRuleCoin(coin),
                        source: convertToClientRuleVertex(source),
                        destination: convertToClientRuleVertex(destination),
                        disabledGroups: convertDisabledGroupsFlagsToEnum(
                            disableManual,
                            disableSuggest,
                        ),
                    };
                }

                return envelope.payload as TReceiveBody;
            }),
        );
    },
}));

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
