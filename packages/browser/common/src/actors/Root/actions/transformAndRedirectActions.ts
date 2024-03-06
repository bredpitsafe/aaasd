import { ActorContext } from 'webactor';

import { sendMetricsEnvBox } from '../../Handlers/actions';
import { publishAllMetricsEnvBox } from '../../Metrics/actions';

export function transformAndRedirectActions(ctx: ActorContext) {
    ctx.subscribe(ctx.dispatch, true);

    publishAllMetricsEnvBox.as$(ctx).subscribe((env) => {
        sendMetricsEnvBox.send(ctx, env.payload);
    });
}
