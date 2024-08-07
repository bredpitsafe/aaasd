import type { Milliseconds, Seconds, Someseconds } from '@common/types';
import { milliseconds2seconds, plus } from '@common/utils';

import type { TSeriesId } from '../../lib/Parts/def';
import { MouseClosestPointsController } from '../services/MouseClosestPointsController';
import type { IContext, TContextState } from '../types';

export function getState(ctx: IContext): TContextState {
    return ctx.state;
}

/**
 * @public
 */
export function setServerTimeIncrement(ctx: TContextState, v: Someseconds): void {
    ctx.serverTimeIncrement = v;
}
export function setClientTimeIncrement(ctx: TContextState, v: Someseconds): void {
    ctx.clientTimeIncrement = v;
}

export function toggleMouseClosestPoints(ctx: IContext, state: boolean): void {
    if (state) {
        if (ctx.mouseClosestPointsController === undefined) {
            ctx.mouseClosestPointsController = new MouseClosestPointsController(ctx);
        }
    } else {
        if (ctx.mouseClosestPointsController) {
            ctx.mouseClosestPointsController.destroy();
            ctx.mouseClosestPointsController = undefined;
        }
    }
}

export function millisecondsToSomeseconds(ctx: TContextState, v: Milliseconds): Someseconds {
    return (v * ctx.millisecondsToSomesecondsRatio) as Someseconds;
}

export function somesecondsToMilliseconds(ctx: TContextState, v: Someseconds): Milliseconds {
    return (v * ctx.somesecondsToMillisecondsRatio) as Milliseconds;
}

export function somesecondsToSeconds(ctx: TContextState, v: Someseconds): Seconds {
    return milliseconds2seconds(somesecondsToMilliseconds(ctx, v));
}

export function getTimeNow(ctx: TContextState): Someseconds {
    return millisecondsToSomeseconds(ctx, Date.now() as Milliseconds);
}

export function getChartTimeNow(ctx: TContextState, id: TSeriesId): Someseconds {
    return plus(getTimeNow(ctx), ctx.timeNowIncrements[id] ?? 0);
}

export function getZonedTime(state: TContextState, value: number): Someseconds {
    return <Someseconds>(value - state.timeZone);
}

export function createLocalState<T extends object>(
    ctx: IContext,
    name: string,
    setter: (prev: undefined | T) => T,
): T {
    return (ctx.state.__states__[name] = setter(ctx.state.__states__[name] as undefined | T));
}

export function destroyLocalState(ctx: IContext, name: string): void {
    ctx.state.__states__[name] = undefined;
}
