import type { IMetrics } from '../../../utils/Metrics';
import { setupFingerprintEnvBox } from '../../actions';
import type { ActorContext } from '../../def.ts';
import {
    collectAppTimeToFrameEnvBox,
    collectClientErrorsEnvBox,
    collectMemoryUsageEnvBox,
    collectResponseTimeEnvBox,
    tableStateStorageSizeEnvBox,
} from '../actions';

export function mailboxListeners(context: ActorContext, metrics: IMetrics) {
    // DON'T DELETE IT, front can't aggregate metrics without it
    setupFingerprintEnvBox.as$(context).subscribe(({ payload }) => {
        metrics.setDefaultLabels({ fingerprint: payload });
    });

    collectResponseTimeEnvBox.as$(context).subscribe(({ payload }) => {
        metrics.responseTimeSummary.labels(...payload.labels).observe(payload.observe);
    });

    collectAppTimeToFrameEnvBox.as$(context).subscribe(({ payload }) => {
        metrics.appTimeToFrameSummary.labels(...payload.labels).observe(payload.observe);
    });

    collectMemoryUsageEnvBox.as$(context).subscribe(({ payload }) => {
        metrics.memoryUsageSummary.labels(...payload.labels).observe(payload.observe);
    });

    collectClientErrorsEnvBox.as$(context).subscribe(({ payload }) => {
        metrics.clientErrorsSummary.labels(...payload.labels).observe(1);
    });

    tableStateStorageSizeEnvBox.as$(context).subscribe(({ payload }) => {
        metrics.tableStateStorageSizeSummary.observe(payload.observe);
    });
}
