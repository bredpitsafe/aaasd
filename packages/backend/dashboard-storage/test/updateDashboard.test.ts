import type { TDashboardItem } from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/common';
import { pick } from 'lodash-es';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { Client, users } from './client/index.ts';
import initialDashboard from './fixtures/dashboard.json';
import { getDashboard } from './utils/index.js';

describe('UpdateDashboard', () => {
    const client = new Client({ authenticate: true });
    const otherClient = new Client({ authenticate: true, as: users.user2.username });

    let dashboard: TDashboardItem | undefined = undefined;
    let id = '';

    beforeEach(async () => {
        const createDashboardResponse = await client.request(initialDashboard);
        expect(createDashboardResponse.state).toBe('Done');
        expect(createDashboardResponse.payload.id).toMatch(/[a-f0-9-]+/);
        id = createDashboardResponse.payload.id;

        dashboard = await getDashboard(client, id);
    });

    afterAll(() => {
        client.close();
        otherClient.close();
    });

    it('update', async () => {
        const updatedDashboard = {
            type: 'UpdateDashboard',
            ...pick(dashboard, 'id', 'digest'),
            name: 'modified name',
            config: 'modified config',
            status: 'Suspended',
        };

        const response = await client.request(updatedDashboard);
        expect(response.state).toBe('Done');
        expect(response.payload.type).toBe('DashboardUpdated');

        // Check that dashboard name and status has been updated
        const newDashboard = await getDashboard(client, id);
        expect(newDashboard?.name).toBe(updatedDashboard.name);
        expect(newDashboard?.status).toBe(updatedDashboard.status);

        // Check that dashboard config has been updated
        const fetchedDashboard = await client.request({ type: 'FetchDashboardConfig', id });
        expect(fetchedDashboard.payload.config).toBe(updatedDashboard.config);
    });

    it('same digest update does succeeds and drops draft', async () => {
        // Step 1. Fetch config for dashboard.
        const {
            payload: { config },
        } = await client.request({ type: 'FetchDashboardConfig', id });

        // Step 2. Update draft with a same config value.
        const draftUpdateResponse = await client.request({
            type: 'UpdateDashboardDraft',
            id,
            config,
        });
        expect(draftUpdateResponse.payload.type).toBe('DashboardDraftUpdated');

        // Step 3. Update dashboard with a same config.
        const request = {
            type: 'UpdateDashboard',
            ...pick(dashboard, 'id', 'name', 'status', 'digest'),
            config,
        };
        const response = await client.request(request);
        expect(response.payload.type).toBe('DashboardUpdated');

        // Step 4. Check that draft doesn't exist anymore.
        const dashboardWithoutDraft = await getDashboard(client, id);
        expect(dashboardWithoutDraft?.hasDraft).toBe(false);
    });

    it('digest mismatch', async () => {
        const updatedDashboard = {
            type: 'UpdateDashboard',
            ...pick(dashboard, 'id'),
            name: 'modified name',
            config: 'modified config',
            status: 'Suspended',
            digest: 'definitely_incorrect_digest',
        };

        const response = await client.request(updatedDashboard);

        expect(response.error).toMatchSnapshot();
    });

    it('resets draft after update', async () => {
        // Step 1. Create draft.
        const draft = {
            ...pick(dashboard, 'id'),
            type: 'UpdateDashboardDraft',
            config: 'modified config draft',
        };
        const draftResponse = await client.request(draft);
        expect(draftResponse.state).toBe('Done');
        expect(draftResponse.payload.type).toBe('DashboardDraftUpdated');

        // Step 2. Update dashboard.
        const updatedDashboard = {
            type: 'UpdateDashboard',
            ...pick(dashboard, 'id', 'status', 'digest'),
            name: 'modified name',
            config: 'modified config',
        };
        const updateResponse = await client.request(updatedDashboard);
        expect(updateResponse.state).toBe('Done');
        expect(updateResponse.payload.type).toBe('DashboardUpdated');

        // Step 3. Check draft, it should be reset.
        const fetchResponse = await client.request({
            type: 'SubscribeToDashboard',
            id,
        });
        expect(fetchResponse.payload.dashboard.name).toBe(updatedDashboard.name);
        expect(fetchResponse.payload.dashboard.hasDraft).toBe(false);
    });

    it('other users`s dashboard', async () => {
        const updatedDashboard = {
            type: 'UpdateDashboard',
            ...pick(dashboard, 'id', 'digest'),
            name: 'modified name',
            config: 'modified config',
            status: 'Suspended',
        };
        const response = await otherClient.request(updatedDashboard);

        expect(response.error).toMatchSnapshot();
    });
});
