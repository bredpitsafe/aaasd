import { ModuleSocketList } from '@frontend/common/src//modules/socketList';
import type { TContextRef } from '@frontend/common/src/di';
import { loadConfig } from '@frontend/common/src/effects/socketList';
import { mapKeys } from 'lodash-es';
import { forkJoin } from 'rxjs';

const PREFIXED_NAMES = ['localhost'];

export function initSocketListEffects(ctx: TContextRef) {
    const { setSockets } = ModuleSocketList(ctx);

    forkJoin([
        loadConfig('urls.json'),
        loadConfig('atf.urls.json'),
        loadConfig('dashboards.urls.json'),
        loadConfig('bff.urls.json'),
    ]).subscribe(([platform, atf, dashboards, bff]) => {
        const platformRenamed = mapKeys(platform, (v, key) => {
            if (!PREFIXED_NAMES.includes(key)) return key;
            return `platform-${key}`;
        });
        const atfRenamed = mapKeys(atf, (v, key) => {
            if (!PREFIXED_NAMES.includes(key)) return key;
            return `atf-${key}`;
        });
        const dashboardsRenamed = mapKeys(dashboards, (v, key) => {
            if (!PREFIXED_NAMES.includes(key)) return key;
            return `dashboards-${key}`;
        });
        const bffRenamed = mapKeys(bff, (v, key) => {
            if (!PREFIXED_NAMES.includes(key)) return key;
            return `bff-${key}`;
        });
        setSockets({ ...platformRenamed, ...atfRenamed, ...dashboardsRenamed, ...bffRenamed });
    });
}
