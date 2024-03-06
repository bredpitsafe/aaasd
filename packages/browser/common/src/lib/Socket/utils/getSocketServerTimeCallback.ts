import { TContextRef } from '../../../di';
import type { TDataSourceName } from '../../../modules/dataSourceStatus/defs';
import { ModuleSocketServerTime } from '../../../modules/socketServerTime';
import type { TSocketURL } from '../../../types/domain/sockets';
import type { Milliseconds } from '../../../types/time';
import { logger } from '../../../utils/Tracing';

export function getSocketServerTimeCallback(
    ctx: TContextRef,
    name: TDataSourceName,
    url: TSocketURL,
) {
    const { getServerTime, setServerTime } = ModuleSocketServerTime(ctx);

    return (diff: Milliseconds) => {
        const minDiff = getServerTime(url) ?? Infinity;

        if (Math.abs(minDiff) > Math.abs(diff)) {
            setServerTime(url, diff);

            logger.info(
                `[ServerTimePlugin] On Socket "${url}", client received server with min time offset ${diff}ms`,
            );
        }
    };
}
