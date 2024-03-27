import { afterAll, describe, expect, it } from 'vitest';

import { Client } from './client/index.js';
import importDashboard from './fixtures/importDashboard.json';

describe('FetchDashboardIdByLegacyId', () => {
    const client = new Client({ authenticate: true });

    afterAll(() => {
        client.close();
    });

    it('gets dashboard id by legacy id', () => async () => {
        const importResponse = await client.request(importDashboard);
        expect(importResponse.payload.id).toBeInstanceOf(String);

        const response = await client.request({
            type: 'FetchDashboardIdByLegacyId',
            legacyId: importDashboard.legacyId,
        });
        expect(response.state).toBe('Done');
        expect(response.payload).toEqual({
            type: 'DashboardId',
            id: importResponse.payload.id,
        });
    });

    it('fails with non-existent legacyId', async () => {
        const response = await client.request({
            type: 'FetchDashboardIdByLegacyId',
            legacyId: Math.floor(Math.random() * 1000000),
        });
        expect(response.state).toBe('Done');
        expect(response.error).toMatchSnapshot();
    });
});
