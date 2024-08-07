import { isUndefined } from 'lodash-es';
import type { Observable } from 'rxjs';

import type { TContextRef } from '../../di';
import { ModuleFactory } from '../../di';
import type { TWithTraceId } from '../../modules/actions/def.ts';
import type { TDedobsOptions } from '../observable/memo';
import { dedobs } from '../observable/memo';

type TProcedureDedobsOptions<Args extends unknown[]> = Required<
    Pick<TDedobsOptions<Args>, 'normalize' | 'resetDelay' | 'removeDelay'>
> &
    Pick<TDedobsOptions<Args>, 'replayCount' | 'removeUnsubscribedDelay'>;

export type TObservableProcedureSettings<Params> = {
    dedobs?: TProcedureDedobsOptions<[Params, TObservableProcedureOptions]>;
};

export type TObservableProcedureOptions = TWithTraceId;

export type TObservableProcedure<Params, Result> = (
    params: Params,
    options: TObservableProcedureOptions,
) => Observable<Result>;

export function createObservableProcedure<Params, Result>(
    constructor: (ctx: TContextRef) => TObservableProcedure<Params, Result>,
    settings?: TObservableProcedureSettings<Params>,
) {
    const useDedobs = !isUndefined(settings?.dedobs);

    const withDedobs =
        (options?: TDedobsOptions<[Params, TObservableProcedureOptions]>) =>
        (procedure: TObservableProcedure<Params, Result>) =>
            useDedobs && !isUndefined(options) ? dedobs(procedure, options) : procedure;

    return ModuleFactory((ctx: TContextRef): TObservableProcedure<Params, Result> => {
        return withDedobs(settings?.dedobs)(constructor(ctx));
    });
}
