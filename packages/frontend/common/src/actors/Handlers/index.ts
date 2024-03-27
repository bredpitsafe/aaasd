import { toContextRef } from '../../di';
import { initSocketListEffects } from '../../effects/socketList';
import { ModuleSendLog } from '../../modules/actions/sendLog';
import { sendMetrics } from '../../modules/actions/sendMetrics';
import { ModuleCommunicationHandlers } from '../../modules/communicationHandlers';
import { EActionTypeHandler } from '../../modules/communicationHandlers/createFetchHandlers';
import { ModuleDataSourceStatus } from '../../modules/dataSourceStatus/module';
import { ESessionTypes, getSession$, setSession, setSessionToken } from '../../modules/session';
import { ModuleSocketServerTime } from '../../modules/socketServerTime';
import { createActor } from '../../utils/Actors';
import { sendSessionEnvBox, sendTokenEnvBox } from '../actions';
import { EActorName } from '../Root/defs';
import {
    publishDataSourceStateEnvBox,
    publishSocketServerTimeEnvBox,
    sendLogEnvBox,
    sendMetricsEnvBox,
    useRemoteHandlerEnvBox,
    useRemoteStreamHandlerEnvBox,
} from './actions';

export function createActorHandlers() {
    return createActor(EActorName.Handlers, async (context) => {
        const ctx = toContextRef(context);
        const sendLog = ModuleSendLog(ctx);

        void initSocketListEffects(ctx);

        sendLogEnvBox.as$(context).subscribe(({ payload }) => sendLog(payload));

        sendMetricsEnvBox.as$(context).subscribe(({ payload }) => sendMetrics(ctx, payload));

        sendTokenEnvBox.as$(context).subscribe(({ payload }) => {
            setSessionToken(payload);
        });
        sendSessionEnvBox.as$(context).subscribe(({ payload }) => {
            setSession(payload);
        });
        getSession$().subscribe((state) => {
            if (state.type === ESessionTypes.NotAuth) {
                self.close();
            }
        });

        const { update, request, requestStream } = ModuleCommunicationHandlers(ctx);

        useRemoteHandlerEnvBox.response(context, ({ type, target, bodies, options }) => {
            if (type === EActionTypeHandler.update) return update(target, bodies[0], options);
            if (type === EActionTypeHandler.request) return request(target, bodies[0], options);

            throw new Error('Invalid type');
        });
        useRemoteStreamHandlerEnvBox.responseStream(
            context,
            ({ type, target, bodies, options }) => {
                if (type === EActionTypeHandler.requestStream)
                    return requestStream(target, () => bodies, options);

                throw new Error('Invalid type');
            },
        );

        const { dataSourceMap$ } = ModuleDataSourceStatus(ctx);

        dataSourceMap$.subscribe((v) => {
            publishDataSourceStateEnvBox.send(context, v);
        });

        const { serverTimeMap$ } = ModuleSocketServerTime(ctx);

        serverTimeMap$.subscribe((v) => {
            publishSocketServerTimeEnvBox.send(context, v);
        });
    });
}
