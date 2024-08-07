import type { Nil } from '@common/types';
import { generateTraceId } from '@common/utils';
import { assert } from '@common/utils/src/assert.ts';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleGetComponentFundingOnCurrentStage } from '@frontend/common/src/modules/actions/components/ModuleGetComponentFundingOnCurrentStage.ts';
import type { THerodotusPreRiskData } from '@frontend/common/src/modules/actions/herodotus/ModuleGetHerodotusPreRiskData.ts';
import { ModuleGetHerodotusPreRiskData } from '@frontend/common/src/modules/actions/herodotus/ModuleGetHerodotusPreRiskData.ts';
import { ModuleGetHerodotusReferenceCurrency } from '@frontend/common/src/modules/actions/herodotus/ModuleGetHerodotusReferenceCurrency.ts';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TVirtualAccountId } from '@frontend/common/src/types/domain/account';
import type { TInstrumentId } from '@frontend/common/src/types/domain/instrument';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import type { ESide } from '@frontend/common/src/types/domain/task';
import { EMPTY_OBJECT } from '@frontend/common/src/utils/const';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useCallback, useMemo } from 'react';
import type { Observable } from 'rxjs';
import { EMPTY } from 'rxjs';

import { FormHerodotusTask } from '../components/FormHerodotusTask';
import { useHerodotusData } from '../hooks/useHerodotusData';
import { ModuleAddHerodotusTask } from '../modules/ModuleAddHerodotusTask.ts';
import type { THerodotusTaskFormData } from '../types';
import type { THerodotusConfig } from '../types/domain';

type TWidgetHerodotusAddTaskFormProps = {
    robot?: TRobot;
    task?: THerodotusTaskFormData;
};

const ADD_TASK_OPTIONS = {
    getNotifyTitle: () => ({
        loading: 'Adding task...',
        success: 'Task has been added',
    }),
};

export const WidgetHerodotusAddTaskForm = (
    props: TWidgetHerodotusAddTaskFormProps,
): ReactElement => {
    const { currentSocketUrl$ } = useModule(ModuleSocketPage);
    const { upsertTabTask } = useModule(ModuleLayouts);
    const getFunding = useModule(ModuleGetComponentFundingOnCurrentStage);
    const addHerodotusTask = useModule(ModuleAddHerodotusTask);
    const getHerodotusPreRiskData = useModule(ModuleGetHerodotusPreRiskData);
    const getHerodotusReferenceCurrency = useModule(ModuleGetHerodotusReferenceCurrency);

    const { robot, task } = props;

    const url = useSyncObservable(currentSocketUrl$);
    const herodotusData = useHerodotusData(robot);

    const [cbSubmit] = useNotifiedObservableFunction((task: THerodotusConfig) => {
        assert(!isNil(robot), 'robot is not defined');
        return addHerodotusTask({ robot, taskConfig: task }, { traceId: generateTraceId() });
    }, ADD_TASK_OPTIONS);
    const cbReset = useFunction(() => upsertTabTask());

    const getPreRiskDesc = useCallback(
        (
            instrumentId: TInstrumentId,
        ): Observable<TValueDescriptor2<Nil | THerodotusPreRiskData>> => {
            return isNil(url) || isNil(robot?.id)
                ? EMPTY
                : getHerodotusPreRiskData(
                      { target: url, robotId: robot.id, instrumentId },
                      { traceId: generateTraceId() },
                  );
        },
        [getHerodotusPreRiskData, url, robot?.id],
    );

    const herodotusReferenceCurrency$ = useMemo(() => {
        return isNil(url) || isNil(robot)
            ? EMPTY
            : getHerodotusReferenceCurrency(
                  { target: url, robotId: robot.id },
                  { traceId: generateTraceId() },
              );
    }, [getHerodotusReferenceCurrency, url, robot?.id]);

    const referenceCurrencyDesc = useNotifiedValueDescriptorObservable(herodotusReferenceCurrency$);

    const getFundingHandler = useFunction(
        (
            instrumentId: TInstrumentId,
            virtualAccountId: string | TVirtualAccountId,
            side: ESide,
        ) => {
            assert(!isNil(robot), 'robot is not defined');
            return getFunding(
                { robotId: robot.id, instrumentId, virtualAccountId, side },
                { traceId: generateTraceId() },
            );
        },
    );

    return (
        <FormHerodotusTask
            herodotusData={herodotusData}
            formData={task !== EMPTY_OBJECT ? task : undefined}
            getPreRiskDesc={getPreRiskDesc}
            getFunding={getFundingHandler}
            referenceCurrencyDesc={referenceCurrencyDesc}
            onSubmit={cbSubmit}
            onReset={cbReset}
        />
    );
};
