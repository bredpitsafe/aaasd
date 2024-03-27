import { createHash } from 'crypto';
import { isEmpty } from 'lodash-es';

import { TDashboard } from '../def/dashboard.ts';
export function getDigest(dashboard: Pick<TDashboard, 'config'>) {
    return isEmpty(dashboard.config)
        ? ''
        : createHash('md5').update(dashboard.config).digest('hex');
}
