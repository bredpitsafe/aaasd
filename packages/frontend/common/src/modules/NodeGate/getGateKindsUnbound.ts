import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { getGateKindsEnvBox } from '../../actors/TradingServersManager/envelops';
import { TSocketURL } from '../../types/domain/sockets';
import { FailFactory } from '../../types/Fail';
import { ValueDescriptor } from '../../types/ValueDescriptor';
import { progressiveRetry } from '../../utils/Rx/progressiveRetry';
import { tapError } from '../../utils/Rx/tap';
import { TraceId } from '../../utils/traceId';
import { SyncDesc, UnscDesc } from '../../utils/ValueDescriptor';
import { IModuleActor } from '../actor';
import { IModuleNotifications } from '../notifications/def';

type TDIContainer = { actor: IModuleActor; notifications: IModuleNotifications; url: TSocketURL };
const GetGateKindsFail = FailFactory('GetGateKinds');
const UNKNOWN = GetGateKindsFail('UNKNOWN');
type TValue = {
    execGates: string[];
    mdGates: string[];
};
export type TGateKindsDescriptor = ValueDescriptor<TValue, typeof UNKNOWN, null>;

export const getGateKindsUnbound = (
    { actor, notifications, url }: TDIContainer,
    traceId: TraceId,
): Observable<TGateKindsDescriptor> => {
    return getGateKindsEnvBox
        .requestStream(actor, {
            url,
            traceId,
        })
        .pipe(
            map((v): TGateKindsDescriptor => SyncDesc(v, null)),
            startWith(UnscDesc(null) as TGateKindsDescriptor),
            tapError((error) => {
                notifications.error({
                    traceId,
                    message: 'Failed to receive gate kinds',
                    description: error.message,
                });
            }),
            progressiveRetry(),
        );
};
