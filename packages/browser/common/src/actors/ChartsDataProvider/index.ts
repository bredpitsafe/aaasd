import { TContextRef } from '../../di';
import { createActor } from '../../utils/Actors';
import { EActorName } from '../Root/defs';
import { getChartPoints } from './actions/getChartPoints';
import { getChartPointsEnvBox } from './envelops';

export function createActorChartsDataProvider() {
    return createActor(EActorName.ChartsDataProvider, async (context) => {
        const ctx = context as unknown as TContextRef;
        getChartPointsEnvBox.responseStream(context, (props) => getChartPoints(ctx, props));
    });
}
