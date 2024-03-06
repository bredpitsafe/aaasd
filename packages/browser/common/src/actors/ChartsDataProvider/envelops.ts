import { createActorObservableBox } from '../../utils/Actors/observable';
import type { TGetChartPointsProps, TGetChartPointsReturnType } from './actions/defs';

export const getChartPointsEnvBox = createActorObservableBox<
    TGetChartPointsProps,
    TGetChartPointsReturnType
>()('getChartPoints');
