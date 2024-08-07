import { isUndefined } from 'lodash-es';

import type { TContextRef } from '../../di';
import { ModuleFactory } from '../../di';
import type { TWithTraceId } from '../../modules/actions/def.ts';
import type { TDedobsOptions } from '../observable/memo';
import { throwingError } from '../throwingError.ts';

type TOptions = TWithTraceId;

type TMemoOptions<Args extends unknown[]> = {
    normalize?: (args: Args) => boolean | number | string;
    removeDelay?: number;
};

type TSettings<Params> = {
    memo?: TMemoOptions<[Params, TOptions]>;
};

type TProcedure<Params, Result> = (params: Params, options: TOptions) => Result;

export function createProcedure<Params, Result>(
    constructor: (ctx: TContextRef) => TProcedure<Params, Result>,
    settings?: TSettings<Params>,
) {
    const useMemo = !isUndefined(settings?.memo);

    const withMemo =
        (options?: TDedobsOptions<[Params, TOptions]>) =>
        (procedure: TProcedure<Params, Result>) =>
            useMemo && !isUndefined(options)
                ? // If you really want to implement memo for function, you have to implement ttl like in Dedobs
                  throwingError('Not implemented')
                : procedure;

    return ModuleFactory((ctx: TContextRef): TProcedure<Params, Result> => {
        return withMemo(settings?.memo)(constructor(ctx));
    });
}
