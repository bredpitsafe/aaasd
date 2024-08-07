import type { TMetric } from '../../modules/actions/metrics/defs.ts';
import type { Summary } from '../../utils/Metrics/Summary';

export function convertSummaryToMetrics(summary: Summary): TMetric[] {
    const transformed: TMetric[] = [];
    const metricByLabel = Object.values(summary.hashMap);
    const percentiles: number[] = summary.percentiles;

    const defaultLabels = summary.registers
        .map((registry) => Object.entries(registry.getDefaultLabels()))
        .flat();

    for (let i = 0; i < metricByLabel.length; i++) {
        if (metricByLabel[i].count === 0) continue;

        metricByLabel[i].td.compress();

        transformed.push({
            name: summary.name,
            labels: defaultLabels.concat(Object.entries(metricByLabel[i].labels)),
            value: {
                kind: 'Summary',
                count: metricByLabel[i].count,
                sum: metricByLabel[i].sum,
                quantiles: percentiles
                    .map((p) => {
                        return [p, metricByLabel[i].td.percentile(p)];
                    })
                    .filter((v): v is [number, number] => v[1] !== undefined && v[1] !== 0),
            },
        });
    }

    return transformed;
}
