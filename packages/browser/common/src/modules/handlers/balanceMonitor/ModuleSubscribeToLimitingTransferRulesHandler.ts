import { map } from 'rxjs/operators';

import type { TSubscribed } from '../../../handlers/def';
import type {
    TAmount,
    TAmountLimitsRuleInfo,
    TCoinId,
    TRuleId,
} from '../../../types/domain/balanceMonitor/defs';
import type { ISO } from '../../../types/time';
import { ServerStreamResourceModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';
import type { TUserName } from '../../user';
import type { TCoinSelectorRaw, TEmptySendBody, TRuleVertexRaw } from './defs';
import { convertToClientRuleCoin, convertToClientRuleVertex } from './utils';

type TUpsertBody = { type: 'LimitingTransferRuleApplied' } & TAmountLimitsRuleInfo;

type TDeleteBody = { type: 'LimitingTransferRuleDeleted'; id: TRuleId };

type TReceiveBody = TSubscribed | TUpsertBody | TDeleteBody;

type TReceiveBodyRaw =
    | {
          type: 'LimitingTransferRuleApplied';

          id: TRuleId;
          coin: TCoinSelectorRaw;
          source: TRuleVertexRaw;
          destination: TRuleVertexRaw;
          note?: string;
          withOpposite: boolean;

          amountMin?: TAmount;
          amountMax?: TAmount;
          amountCurrency: TCoinId;
          rulePriority: number;
          doNotOverride: boolean;

          username: TUserName;
          createTime: ISO;
          updateTime: ISO;
      }
    | TDeleteBody;

export const ModuleSubscribeToLimitingTransferRulesHandler = ServerStreamResourceModuleFactory<
    TEmptySendBody,
    TReceiveBodyRaw
>('SubscribeToLimitingTransferRules', { skipAuthentication: false })(() => ({
    extendPipe(resource) {
        return resource.pipe(
            map((envelope) => {
                if (envelope.payload.type === 'LimitingTransferRuleApplied') {
                    const {
                        payload: { coin, source, destination, ...payload },
                    } = envelope;

                    return {
                        ...payload,
                        coinsMatchRule: convertToClientRuleCoin(coin),
                        source: convertToClientRuleVertex(source),
                        destination: convertToClientRuleVertex(destination),
                    };
                }

                return envelope.payload as TReceiveBody;
            }),
        );
    },
}));
