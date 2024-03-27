import { useRef, useState } from 'react';
import { Observable } from 'rxjs';

import { TFail } from '../types/Fail';
import { ValueDescriptor } from '../types/ValueDescriptor';
import { invariant } from '../utils/fn';
import { useFunction } from '../utils/React/useFunction';
import { generateTraceId, TraceId } from '../utils/traceId';
import { IdleDesc, isUnscDesc } from '../utils/ValueDescriptor';

export function useMutationHandler<Params, R, F extends TFail<string>, P>(
    handler: (p: Params, traceId: TraceId) => Observable<ValueDescriptor<R, F, P>>,
): [ValueDescriptor<R, F, P>, (p: Params) => void, () => void] {
    const initialHandler = useRef(handler);
    invariant(
        handler !== initialHandler.current,
        'The handler function pointer has changed in the useMutationHandler',
    );
    const [current, setCurrent] = useState<ValueDescriptor<R, F, P>>(IdleDesc());

    const startHandler = useFunction((p: Params) => {
        if (isUnscDesc(current)) return;
        handler(p, generateTraceId()).subscribe((descriptor) => {
            setCurrent(descriptor);
        });
    });
    const resetToIdle = useFunction(() => {
        setCurrent(IdleDesc());
    });

    return [current, startHandler, resetToIdle];
}
