import { randomUUID } from 'crypto';
import { afterAll, describe, expect, it } from 'vitest';

import { Client, users } from './client/index.js';
import initialDashboard from './fixtures/dashboard.json';
import { getDashboard } from './utils/index.js';

describe('UpdateDashboardDraft', () => {
    const client = new Client({ authenticate: true });
    const otherClient = new Client({ authenticate: true, as: users.user2.username });

    it('updates and resets draft', async () => {
        const { id } = (await client.request(initialDashboard)).payload;
        const draft = {
            type: 'UpdateDashboardDraft',
            id,
            config: 'draft config',
        };
        const response = await client.request(draft);
        expect(response.state).toBe('Done');
        expect(response.payload).toMatchObject({
            type: 'DashboardDraftUpdated',
        });

        const dashboard = await getDashboard(client, id);

        expect(dashboard).toMatchObject({
            hasDraft: true,
            draftDigest: expect.any(String),
        });

        const resetDraftResponse = await client.request({ type: 'ResetDashboardDraft', id });
        expect(resetDraftResponse.payload).toMatchObject({
            type: 'DashboardDraftReset',
        });

        const dashboardWithoutDraft = await getDashboard(client, id);
        expect(dashboardWithoutDraft).toMatchObject({
            id,
            hasDraft: false,
            draftDigest: '',
        });
    });

    it('fails to update (no dashboard)', async () => {
        const draft = {
            type: 'UpdateDashboardDraft',
            id: randomUUID(),
            config: 'draft config',
        };

        const response = await client.request(draft);

        expect(response.error).toMatchSnapshot();
    });

    it('fails to update (no permission)', async () => {
        const { id } = (await otherClient.request(initialDashboard)).payload;

        const draft = {
            type: 'UpdateDashboardDraft',
            id,
            config: 'draft config',
        };

        const response = await client.request(draft);

        expect(response.error).toMatchSnapshot();
    });

    it('fails to update (no config)', async () => {
        const { id } = (await client.request(initialDashboard)).payload;

        const draft = {
            type: 'UpdateDashboardDraft',
            id,
        };

        const response = await client.request(draft);

        expect(response.error).toMatchSnapshot();
    });

    afterAll(() => {
        client.close();
        otherClient.close();
    });
});
