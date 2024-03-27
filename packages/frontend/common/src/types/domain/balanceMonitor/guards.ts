import { isEmpty } from 'lodash-es';

import type { TBalanceReconciliationInProgressStep, TBalanceReconciliationStep } from './defs';

export function isInProgressBalanceReconciliationStep(
    solution: TBalanceReconciliationStep | TBalanceReconciliationInProgressStep,
): solution is TBalanceReconciliationInProgressStep {
    return (
        'id' in solution &&
        // Server should send ID for IN PROGRESS solutions only, but has bug - sends for every solution
        !isEmpty(solution.id) &&
        'status' in solution &&
        !isEmpty(solution.status)
    );
}
