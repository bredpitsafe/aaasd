import { once } from 'lodash-es';
import { tap } from 'rxjs/operators';

import type { TReceivedData } from '../../../lib/BFFSocket/def';
import type { TSocketURL } from '../../../types/domain/sockets';
import { logger } from '../../../utils/Tracing';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types';
import { isReceivingValueDescriptor } from '../../../utils/ValueDescriptor/utils';

export function traceFirstReceiveChunkOperator<T extends TValueDescriptor2<TReceivedData<unknown>>>(
    url: TSocketURL,
    type: string,
) {
    const logOnce = once(() =>
        logger.trace('[FetchHandlers]: Receive first chunk', {
            url,
            requestType: type,
        }),
    );

    return tap<T>((vd) => {
        if (isReceivingValueDescriptor(vd)) {
            logOnce();
        }
    });
}
