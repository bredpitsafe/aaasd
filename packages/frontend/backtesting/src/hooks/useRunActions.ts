import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type {
    TBacktestingRun,
    TBacktestingRunId,
} from '@frontend/common/src/types/domain/backtestings';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction';
import { first, switchMap } from 'rxjs';

import { ModulePauseBacktestingRun } from '../modules/actions/ModulePauseBacktestingRun';
import { ModuleResumeBacktestingRun } from '../modules/actions/ModuleResumeBacktestingRun';

type TUseRunActionsReturnType = {
    resumeRun: (id: TBacktestingRunId) => void;
    pauseRun: (id: TBacktestingRunId) => void;
};
export const useRunActions = (): TUseRunActionsReturnType => {
    const traceId = useTraceId();
    const { currentSocketUrl$ } = useModule(ModuleSocketPage);
    const pauseBacktestingRun = useModule(ModulePauseBacktestingRun);
    const resumeBacktestingRun = useModule(ModuleResumeBacktestingRun);

    const [pauseRun] = useNotifiedObservableFunction(
        (btRunNo: TBacktestingRun['btRunNo']) => {
            return currentSocketUrl$.pipe(
                first((target): target is TSocketURL => target !== undefined),
                switchMap((target) => pauseBacktestingRun({ target, btRunNo }, { traceId })),
            );
        },
        {
            getNotifyTitle: (btRunNo: TBacktestingRun['btRunNo']) => `Pause Run ${btRunNo}`,
        },
    );

    const [resumeRun] = useNotifiedObservableFunction(
        (btRunNo: TBacktestingRun['btRunNo']) => {
            return currentSocketUrl$.pipe(
                first((target): target is TSocketURL => target !== undefined),
                switchMap((target) => resumeBacktestingRun({ target, btRunNo }, { traceId })),
            );
        },
        {
            getNotifyTitle: (btRunNo: TBacktestingRun['btRunNo']) => `Resume Run ${btRunNo}`,
        },
    );

    return {
        pauseRun,
        resumeRun,
    };
};
