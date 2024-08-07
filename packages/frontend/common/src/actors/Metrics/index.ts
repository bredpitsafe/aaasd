import type { TContextRef } from '../../di';
import { ModuleSendLog } from '../../modules/actions/logs/ModuleSendLog.ts';
import { ModuleSendMetrics } from '../../modules/actions/metrics/ModuleSendMetrics.ts';
import { createActor } from '../../utils/Actors';
import { EMPTY_ARRAY } from '../../utils/const';
import { createMetrics } from '../../utils/Metrics';
import { Summary } from '../../utils/Metrics/Summary';
import { EActorName } from '../Root/defs';
import { publishAllMetricsEnvBox, sendLogEnvBox, sendMetricsEnvBox } from './actions';
import { mailboxListeners } from './effects/mailbox';
import { convertSummaryToMetrics } from './utils';

export function createActorMetrics() {
    return createActor(EActorName.Metrics, (context) => {
        const ctx = context as unknown as TContextRef;
        const sendLog = ModuleSendLog(ctx);
        const sendMetrics = ModuleSendMetrics(ctx);
        const metrics = createMetrics();

        mailboxListeners(context, metrics);

        setInterval(async () => {
            const all = metrics.getAllMetrics();
            const transformed = all
                .map((metric) => {
                    if (metric instanceof Summary) return convertSummaryToMetrics(metric);
                    else return EMPTY_ARRAY;
                })
                .flat();

            publishAllMetricsEnvBox.send(context, transformed);
        }, 15 * 1_000);

        publishAllMetricsEnvBox.as$(context).subscribe((env) => {
            sendMetricsEnvBox.send(context, env.payload);
        });

        sendLogEnvBox.as$(context).subscribe(({ payload }) => sendLog(payload));
        sendMetricsEnvBox.as$(context).subscribe(({ payload }) => sendMetrics(payload));
    });
}
