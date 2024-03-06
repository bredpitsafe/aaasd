import { useModule } from '@frontend/common/src/di/react';
import {
    ModuleGetHerodotusPreRiskData,
    THerodotusPreRiskDataReturnType,
} from '@frontend/common/src/modules/actions/ModuleGetHerodotusPreRiskData';
import { ModuleGetHerodotusReferenceCurrency } from '@frontend/common/src/modules/actions/ModuleGetHerodotusReferenceCurrency';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { TInstrumentId } from '@frontend/common/src/types/domain/instrument';
import { TRobot } from '@frontend/common/src/types/domain/robots';
import { assert } from '@frontend/common/src/utils/assert';
import { EMPTY_OBJECT } from '@frontend/common/src/utils/const';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useValueDescriptorObservableDeprecated } from '@frontend/common/src/utils/React/useValueDescriptorObservableDeprecated';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { isNil } from 'lodash-es';
import { ReactElement, useCallback, useMemo } from 'react';
import { EMPTY, firstValueFrom, Observable } from 'rxjs';

import { FormHerodotusTask } from '../components/FormHerodotusTask';
import { useHerodotusData } from '../hooks/useHerodotusData';
import { ModuleHerodotusTaskActions } from '../modules/herodotusTaskActions';
import { THerodotusTaskFormData } from '../types';
import { THerodotusConfig } from '../types/domain';

type TWidgetHerodotusAddTaskFormProps = {
    robot?: TRobot;
    task?: THerodotusTaskFormData;
};

export const WidgetHerodotusAddTaskForm = (
    props: TWidgetHerodotusAddTaskFormProps,
): ReactElement => {
    const { currentSocketUrl$ } = useModule(ModuleSocketPage);
    const { addHerodotusTask } = useModule(ModuleHerodotusTaskActions);
    const { upsertTabTask } = useModule(ModuleLayouts);
    const { getHerodotusPreRiskData } = useModule(ModuleGetHerodotusPreRiskData);
    const { getHerodotusReferenceCurrency } = useModule(ModuleGetHerodotusReferenceCurrency);

    const { robot, task } = props;

    const traceId = useMemo(() => generateTraceId(), []);
    const url = useSyncObservable(currentSocketUrl$);
    const herodotusData = useHerodotusData(robot);

    const cbSubmit = useFunction((task: THerodotusConfig) => {
        assert(!isNil(robot), 'robot is not defined');
        return firstValueFrom(addHerodotusTask(robot, task));
    });
    const cbReset = useFunction(() => upsertTabTask());

    const getPreRiskDesc = useCallback(
        (instrumentId: TInstrumentId): Observable<THerodotusPreRiskDataReturnType> =>
            isNil(url) || isNil(robot?.id)
                ? EMPTY
                : getHerodotusPreRiskData(url, robot.id, instrumentId, traceId),
        [getHerodotusPreRiskData, url, robot?.id, traceId],
    );

    const referenceCurrencyDesc = useValueDescriptorObservableDeprecated(
        isNil(url) || isNil(robot) ? EMPTY : getHerodotusReferenceCurrency(url, robot.id, traceId),
    );

    return (
        <FormHerodotusTask
            herodotusData={herodotusData}
            formData={task !== EMPTY_OBJECT ? task : undefined}
            getPreRiskDesc={getPreRiskDesc}
            referenceCurrencyDesc={referenceCurrencyDesc}
            onSubmit={cbSubmit}
            onReset={cbReset}
        />
    );
};
