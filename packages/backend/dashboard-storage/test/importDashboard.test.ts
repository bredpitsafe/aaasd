import { intersection, uniq } from 'lodash-es';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { Client, users } from './client/index.js';
import importDashboard from './fixtures/importDashboard.json';
import { clearDashboards } from './utils/db.js';

describe('ImportDashboard', () => {
    const client: Client = new Client({ authenticate: true });
    const otherClient = new Client({ authenticate: true, as: users.user2.username });

    beforeEach(async () => {
        await clearDashboards();
    });

    it('create - with legacy id', async () => {
        const response = await client.request(importDashboard);
        expect(response.state).toBe('Done');
        expect(response.payload.type).toBe('DashboardImported');
        expect(response.payload.id).toEqual(expect.any(String));
    });

    it('create - several dashboards with digest deduplication per user', async () => {
        const length = 10;
        const dashboard = { ...importDashboard, legacyId: 0 };
        const arr = Array.from({ length });
        const ids1: string[] = [];
        const ids2: string[] = [];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const _ of arr) {
            ids1.push((await client.request(dashboard)).payload.id);
            ids2.push((await otherClient.request(dashboard)).payload.id);
        }

        expect(ids1).toHaveLength(length);
        expect(ids2).toHaveLength(length);
        expect(uniq(ids1)).toHaveLength(1);
        expect(uniq(ids2)).toHaveLength(1);
        expect(intersection(ids1, ids2)).toHaveLength(0);
    });

    it('create - previously created by another user', async () => {
        const { id } = (await client.request(importDashboard)).payload;

        const otherClientResponse = await otherClient.request(importDashboard);
        expect(otherClientResponse.state).toBe('Done');
        expect(otherClientResponse.payload.type).toBe('DashboardImported');
        expect(otherClientResponse.payload.id).toBe(id);
    });

    afterAll(() => {
        client.close();
        otherClient.close();
    });
});
