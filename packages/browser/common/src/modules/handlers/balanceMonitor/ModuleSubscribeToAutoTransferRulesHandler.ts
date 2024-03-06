import { map } from 'rxjs/operators';

import type { TSubscribed } from '../../../handlers/def';
import { TReceivedData } from '../../../lib/BFFSocket/def';
import type { TAutoTransferRuleInfo, TRuleId } from '../../../types/domain/balanceMonitor/defs';
import type { ISO } from '../../../types/time';
import { ServerStreamResourceModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';
import type { TUserName } from '../../user';
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

export const ModuleSubscribeToAutoTransferRulesHandler = ServerStreamResourceModuleFactory<
    TEmptySendBody,
    TReceiveBodyRaw
>('SubscribeToAutoTransferRules', { skipAuthentication: false })(() => ({
    extendPipe(resource) {
        return resource.pipe(
            map((envelope) => {
                if (envelope.payload.type === 'AutoTransferRuleApplied') {
                    const {
                        payload: { coin, source, destination, ...payload },
                    } = envelope;

                    return {
                        ...envelope,
                        payload: {
                            ...payload,
                            coinsMatchRule: convertToClientRuleCoin(coin),
                            source: convertToClientRuleVertex(source),
                            destination: convertToClientRuleVertex(destination),
                        },
                    };
                }

                return envelope as TReceivedData<TReceiveBody>;
            }),
        );
    },
}));
