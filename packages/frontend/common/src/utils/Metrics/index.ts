import { Registry } from './Registry';
import { Summary } from './Summary';

export type IMetrics = ReturnType<typeof createMetrics>;

export function createMetrics() {
    const registry = new Registry();

    const clientErrorsSummary = new Summary({
        name: 'client_errors',
        help: 'browser runtime panics',
        labelNames: ['source'],
        percentiles: [0.5, 0.9],
        registers: [registry],
    });

    const responseTimeSummary = new Summary({
        name: 'response_time_milliseconds',
        help: 'response time from server',
        labelNames: ['url'],
        percentiles: [0.5, 0.75, 0.9],
        registers: [registry],
    });

    const memoryUsageSummary = new Summary({
        name: 'memory_usage',
        help: 'memory usage at tab/worker/sharedWorker',
        labelNames: ['source'],
        percentiles: [0.5, 0.75, 0.9],
        registers: [registry],
    });

    const appTimeToFrameSummary = new Summary({
        name: 'app_frame_milliseconds',
        help: 'time to execute all js for tab/worker/sharedWorker',
        labelNames: ['source'],
        percentiles: [0.5, 0.75, 0.9],
        registers: [registry],
    });

    const charterTimeToFrameSummary = new Summary({
        name: 'charter_frame_milliseconds',
        help: 'time to execute all js for each charter instance',
        percentiles: [0.5, 0.75, 0.9],
        registers: [registry],
    });

    const tableStateStorageSizeSummary = new Summary({
        name: 'table_state_size',
        help: 'size of table state',
        percentiles: [0.5, 0.75, 0.9],
        registers: [registry],
    });

    return {
        getAllMetrics: registry.getMetrics.bind(registry),
        setDefaultLabels: registry.setDefaultLabels.bind(registry),
        clientErrorsSummary,
        memoryUsageSummary,
        appTimeToFrameSummary,
        charterTimeToFrameSummary,
        responseTimeSummary,
        tableStateStorageSizeSummary,
    };
}
