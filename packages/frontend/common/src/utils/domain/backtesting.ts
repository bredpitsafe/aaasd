import { EBacktestingRunStatus } from '../../types/domain/backtestings';

export function backtestingRunCanBeStopped(status: EBacktestingRunStatus) {
    switch (status) {
        case EBacktestingRunStatus.Paused:
        case EBacktestingRunStatus.Running:
        case EBacktestingRunStatus.Initializing:
            return true;
        default:
            return false;
    }
}

export function backtestingRunCanBePaused(status: EBacktestingRunStatus) {
    switch (status) {
        case EBacktestingRunStatus.Running:
            return true;
        default:
            return false;
    }
}

export function backtestingRunCanBeResume(status: EBacktestingRunStatus) {
    switch (status) {
        case EBacktestingRunStatus.Paused:
            return true;
        default:
            return false;
    }
}
