import { useModule } from '@frontend/common/src/di/react';
import { ModuleGetFunding, TFunding } from '@frontend/common/src/modules/actions/ModuleGetFunding';
import {
    ModuleGetHerodotusPreRiskData,
    THerodotusPreRiskDataReturnType,
} from '@frontend/common/src/modules/actions/ModuleGetHerodotusPreRiskData';
import { ModuleGetHerodotusReferenceCurrency } from '@frontend/common/src/modules/actions/ModuleGetHerodotusReferenceCurrency';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TVirtualAccountId } from '@frontend/common/src/types/domain/account';
import type { TInstrumentId } from '@frontend/common/src/types/domain/instrument';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import type { ESide } from '@frontend/common/src/types/domain/task';
import { assert } from '@frontend/common/src/utils/assert';
import { EMPTY_OBJECT } from '@frontend/common/src/utils/const';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useValueDescriptorObservableDeprecated } from '@frontend/common/src/utils/React/useValueDescriptorObservableDeprecated';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { LOADING_VD } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { ReactElement, useCallback, useMemo } from 'react';
import { EMPTY, firstValueFrom, Observable, of } from 'rxjs';

import { FormHerodotusTask } from '../components/FormHerodotusTask';
import { useHerodotusData } from '../hooks/useHerodotusData';
import { ModuleHerodotusTaskActions } from '../modules/herodotusTaskActions';
import { THerodotusTaskFormData } from '../types';
import type { THerodotusConfig } from '../types/domain';

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
    const { getFunding } = useModule(ModuleGetFunding);

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

    const getFundingHandler = useCallback(
        (
            instrumentId: TInstrumentId,
            virtualAccountId: string | TVirtualAccountId,
            side: ESide,
        ): Observable<TValueDescriptor2<TFunding>> =>
            isNil(robot)
                ? of(LOADING_VD)
                : getFunding(robot.id, instrumentId, virtualAccountId, side),
        [robot],
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
