import { isUndefined } from 'lodash-es';
import { Observable } from 'rxjs';

import { ModuleFactory, TContextRef } from '../../di';
import { TWithTraceId } from '../../handlers/def';
import { dedobs, TDedobsOptions } from '../observable/memo';

type TOptions = TWithTraceId;

type TSettings<Params> = {
    dedobs?: TDedobsOptions<[Params, TOptions]>;
};

type TProcedure<Params, Result> = (params: Params, options: TOptions) => Observable<Result>;

export function createObservableProcedure<Params, Result>(
    constructor: (ctx: TContextRef) => TProcedure<Params, Result>,
    settings?: TSettings<Params>,
) {
    const useDedobs = !isUndefined(settings?.dedobs);

    const withDedobs =
        (options?: TDedobsOptions<[Params, TOptions]>) =>
        (procedure: TProcedure<Params, Result>) =>
            useDedobs && !isUndefined(options) ? dedobs(procedure, options) : procedure;

    return ModuleFactory((ctx: TContextRef): TProcedure<Params, Result> => {
        return withDedobs(settings?.dedobs)(constructor(ctx));
    });
}
