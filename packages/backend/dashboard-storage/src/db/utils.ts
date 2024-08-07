import { createHash } from 'crypto';
import { isEmpty } from 'lodash-es';

import type { TDbDashboard } from '../def/dashboard.ts';

export function getDigest(config: TDbDashboard['config']) {
    return isEmpty(config) ? '' : createHash('md5').update(config).digest('hex');
}
