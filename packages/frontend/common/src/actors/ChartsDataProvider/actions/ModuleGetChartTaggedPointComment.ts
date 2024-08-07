import type { Nanoseconds } from '@common/types';
import { sum } from '@common/utils';
import { assertNever } from '@common/utils/src/assert.ts';
import { extractValidNumber } from '@common/utils/src/extract.ts';
import { isFunction, isString, isUndefined } from 'lodash-es';
import type { Observable } from 'rxjs';
import { combineLatest, of } from 'rxjs';

import type { TWithTraceId } from '../../../modules/actions/def.ts';
import type { TBacktestingRunId } from '../../../types/domain/backtestings';
import type { TSocketName, TSocketURL } from '../../../types/domain/sockets';
import { createObservableProcedure } from '../../../utils/LPC/createObservableProcedure';
import { mapValueDescriptor, squashValueDescriptors } from '../../../utils/Rx/ValueDescriptor2';
import type { TPointFormatterArgs } from '../../../utils/Sandboxes/pointFormatter';
import { getPointFormatterSandbox } from '../../../utils/Sandboxes/pointFormatter';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils';
import { TIME_DELTA } from './defs';
import { ModuleFetchIndicatorsVisualConfigs } from './ModuleFetchIndicatorsVisualConfigs';
import type { TTaggedTimeseriesData } from './ModuleFetchTaggedTimeseriesData';
import type { TGetIndicatorTaggedData } from './ModuleGetIndicatorTaggedData';
import { ModuleGetIndicatorTaggedData } from './ModuleGetIndicatorTaggedData';

export type TGetChartTaggedPointCommentProps = TGetIndicatorTaggedData & {
    value: number;

    indicatorName: string;
    backtestingId: TBacktestingRunId;

    // undefined - use styler from visual configs
    formatter?: undefined | string;
};

export const ModuleGetChartTaggedPointComment = createObservableProcedure((ctx) => {
    const getTaggedData = ModuleGetIndicatorTaggedData(ctx);
    const getTaggedPoints: (
        props: {
            target: TSocketURL;
            stage: TSocketName;
            value: number;
            timeInc: Nanoseconds;
        },
        options: TWithTraceId,
    ) => Observable<TValueDescriptor2<{ value: number; discriminant: string }>> =
        // @ts-ignore - waiting when be release in FRT-1593.
        ModuleGetIndicatorTaggedPoints(ctx);
    const fetchVisualConfigs = ModuleFetchIndicatorsVisualConfigs(ctx);

    return (
        params: TGetChartTaggedPointCommentProps,
        options,
    ): Observable<TTaggedTimeseriesData[keyof TTaggedTimeseriesData]> => {
        const data$ = getTaggedData(params, options);
        const point$ = getTaggedPoints(params, options);
        const configs$ = isString(params.formatter)
            ? of(createSyncedValueDescriptor(params))
            : fetchVisualConfigs(
                  {
                      target: params.target,
                      keys: [
                          {
                              stage: params.stage,
                              name: params.indicatorName,
                              btRunNo: extractValidNumber(params.backtestingId),
                          },
                      ],
                  },
                  options,
              ).pipe(
                  mapValueDescriptor(({ value }) => {
                      return createSyncedValueDescriptor(value[0]);
                  }),
              );

        return combineLatest({
            data: data$,
            point: point$,
            configs: configs$,
        }).pipe(
            squashValueDescriptors(),
            mapValueDescriptor(({ value: { data, point, configs } }) => {
                const getTooltip = getFormatterFactory(configs.formatter ?? params.formatter);
                return getTooltip(
                    sum(TIME_DELTA, params.timeInc),
                    point.value,
                    point.discriminant,
                    data,
                );
            }),
        );
    };
});

type TInternalPointTooltip = {
    message: string;
};

function getFormatterFactory(formatter: undefined | string) {
    const tooltip = { message: '' };
    const args: TPointFormatterArgs = {
        nestedValues: {},
        discriminant: '',
        time: 0 as Nanoseconds,
        value: 0,
    };

    const sandbox = getPointFormatterSandbox(formatter);

    if (isUndefined(sandbox)) {
        return () => tooltip;
    }

    if (isFunction(sandbox)) {
        const ctx = { tooltip, data: args };
        return (
            time: Nanoseconds,
            value: number,
            discriminant: string,
            nestedValues: object,
        ): TInternalPointTooltip => {
            args.time = time;
            args.value = value;
            args.discriminant = discriminant;
            args.nestedValues = nestedValues;

            sandbox(ctx);

            return tooltip;
        };
    }

    assertNever(sandbox);
}
