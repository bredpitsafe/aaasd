import { generateTraceId } from '@common/utils';
import { assert } from '@common/utils/src/assert.ts';
import { EModalProps, EModalSelectors } from '@frontend/common/e2e/selectors/modal.selectors';
import type { SelectProps } from '@frontend/common/src/components/Select.tsx';
import { Select } from '@frontend/common/src/components/Select.tsx';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings.ts';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TStrategyName } from '@frontend/common/src/types/domain/ownTrades.ts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import {
    isLoadingValueDescriptor,
    WAITING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';
import { firstValueFrom, of, switchMap } from 'rxjs';

import { ModuleExcludedStrategies } from '../modules/actions/ModuleExcludedStrategies.ts';
import { ModuleSubscribeToStrategiesList } from '../modules/actions/ModuleSubscribeToStrategiesList.ts';

type TWidgetExcludedStrategiesProps = SelectProps;
export const WidgetExcludedStrategies = (props: TWidgetExcludedStrategiesProps) => {
    const subscribeToStrategiesList = useModule(ModuleSubscribeToStrategiesList);
    const { currentSocketStruct$ } = useModule(ModuleSocketPage);
    const { subscribeToExcludedStrategies, setExcludedStrategies } =
        useModule(ModuleExcludedStrategies);
    const [timeZoneInfo] = useTimeZoneInfoSettings();

    const [setExcludedStrategiesFn, , , isSettingExcludedStrategies] =
        useNotifiedObservableFunction(setExcludedStrategies, {
            getNotifyTitle: () => ({
                loading: `Updating excluded strategies...`,
                success: `Excluded strategies list saved`,
            }),
        });

    const strategies$ = useMemo(
        () =>
            currentSocketStruct$.pipe(
                switchMap((target) =>
                    isNil(target)
                        ? of(WAITING_VD)
                        : subscribeToStrategiesList(
                              {
                                  target,
                                  timeZone: timeZoneInfo.timeZone,
                                  showExcludedStrategies: true,
                              },
                              { traceId: generateTraceId() },
                          ),
                ),
            ),

        [currentSocketStruct$, subscribeToStrategiesList, timeZoneInfo.timeZone],
    );

    const excludedStrategies$ = useMemo(
        () =>
            currentSocketStruct$.pipe(
                switchMap((target) =>
                    isNil(target) ? of(undefined) : subscribeToExcludedStrategies(target),
                ),
            ),
        [currentSocketStruct$, subscribeToExcludedStrategies],
    );

    const cbSetExcludedStrategies = useFunction(async (value: TStrategyName[]) => {
        const target = await firstValueFrom(currentSocketStruct$);
        assert(!isNil(target), 'Socket is not defined');
        await setExcludedStrategiesFn(target, value);
    });

    const strategies = useNotifiedValueDescriptorObservable(strategies$);
    const excludedStrategies = useSyncObservable(excludedStrategies$);
    const loading = isLoadingValueDescriptor(strategies) || isSettingExcludedStrategies;

    return (
        <Select
            {...EModalProps[EModalSelectors.ExcludedStrategiesFilterInput]}
            mode="tags"
            value={excludedStrategies ?? []}
            onChange={cbSetExcludedStrategies}
            options={strategies.value || undefined}
            autoClearSearchValue={false}
            loading={loading}
            {...props}
        />
    );
};
