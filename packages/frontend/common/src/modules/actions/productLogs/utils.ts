import { isNil } from 'lodash-es';

import { shallowHash } from '../../../utils/shallowHash';
import { logger } from '../../../utils/Tracing';
import type { TProductLog } from './defs.ts';

export function tryFixFingerprints(items: TProductLog[]): TProductLog[] {
    const existed = new Set<TProductLog['fingerprint']>();
    let everyHasFingerprint = true;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (!isNil(item.dedupKey) && !isNil(item.dedupCount)) {
            // As dedupKey + dedupCount is not uniq calc fingerprint with several fields
            item.fingerprint = String(
                shallowHash(
                    item.dedupKey,
                    item.dedupCount,
                    item.actorGroup,
                    item.actorKey,
                    item.message,
                    item.level,
                    item.component,
                    item.platformTime,
                ),
            );
        }

        const hasOriginalFingerprint = !isNil(item.fingerprint);

        if (!hasOriginalFingerprint) {
            everyHasFingerprint = false;
            item.fingerprint = 'UI_' + String(shallowHash(JSON.stringify(item)));
        }

        if (existed.has(item.fingerprint)) {
            item.fingerprint = item.fingerprint + '_' + Math.random();
            hasOriginalFingerprint &&
                logger.error(`[ProductLogs]: duplicate with fingerprint ${item.fingerprint}`);
        }

        existed.add(item.fingerprint);
    }

    if (!everyHasFingerprint) {
        logger.error(`[ProductLogs]: empty fingerprints`);
    }

    return items;
}
