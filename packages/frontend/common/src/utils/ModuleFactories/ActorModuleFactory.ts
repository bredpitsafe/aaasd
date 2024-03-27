import { isUndefined, once } from 'lodash-es';
import { Observable, OperatorFunction } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';

import { ModuleFactory, TContextRef } from '../../di';
import { ModuleMessages } from '../../lib/messages';
import { SocketStreamError } from '../../lib/SocketStream/SocketStreamError';
import { ModuleActor } from '../../modules/actor';
import { ModuleNotifications } from '../../modules/notifications/module';
import { GrpcError } from '../../types/GrpcError';
import { TStructurallyCloneable } from '../../types/serialization';
import { TActorObservableBox } from '../Actors/observable/def';
import { assert } from '../assert';
import { isWindow } from '../detect';
import { noop } from '../fn';

export function ActorActionModuleFactory<
    Send extends TStructurallyCloneable,
    Receive extends TStructurallyCloneable,
>(resourceFactory: TActorObservableBox<any, Send, Receive>) {
    assert(isWindow, '[ActorActionModuleFactory] Can be used only in Window context');

    return function <Params extends TStructurallyCloneable = Send, Result = Receive>(
        optionsFactory?: (send: Params) => {
            params?: Send;
            isSuccess?: (envelope: Receive) => boolean;
            loading?: () => string;
            success?: () => string;
            error?: (err: Error | GrpcError | SocketStreamError) => {
                message: string;
                description?: string;
            };
            extendPipe?: OperatorFunction<Receive, Result>;
        },
    ) {
        return ModuleFactory((ctx: TContextRef) => {
            const notify = ModuleNotifications(ctx);
            const messages = ModuleMessages(ctx);
            const resource = resourceFactory.requestStream.bind(null, ModuleActor(ctx));

            return (params: Params): Observable<Result> => {
                const options = isUndefined(optionsFactory) ? undefined : optionsFactory(params);
                const close = isUndefined(options?.loading)
                    ? noop
                    : messages.loading(options!.loading(), 5000);
                const resource$ = resource((options?.params ?? params) as Send);
                const onceSuccess = once(() => {
                    if (!isUndefined(options) && !isUndefined(options.success)) {
                        void messages.success(options.success());
                    }
                });

                return resource$.pipe(
                    tap({
                        next: (envelope) => {
                            if (options?.isSuccess?.(envelope)) onceSuccess();
                        },
                        error: (err: Error | GrpcError | SocketStreamError) => {
                            const messageAndDescription = isUndefined(options?.error)
                                ? undefined
                                : options!.error(err);

                            notify.error({
                                message: isUndefined(messageAndDescription)
                                    ? `Fail`
                                    : messageAndDescription.message,
                                description: isUndefined(messageAndDescription)
                                    ? err.message
                                    : messageAndDescription.description,
                                traceId: err instanceof SocketStreamError ? err.traceId : undefined,
                            });
                        },
                    }),
                    finalize(close),
                    options?.extendPipe ??
                        map<Receive, Result>((envelope) => envelope as unknown as Result),
                );
            };
        });
    };
}
