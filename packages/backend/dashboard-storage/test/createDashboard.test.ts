import { omit } from 'lodash-es';
import { afterAll, describe, expect, it } from 'vitest';

import { Client } from './client/index.js';
import dashboard from './fixtures/dashboard.json';

describe('CreateDashboard', () => {
    const client: Client = new Client({ authenticate: true });

    it('create - all fields', async () => {
        const response = await client.request(dashboard);
        expect(response.state).toBe('Done');
        expect(response.payload.type).toBe('DashboardCreated');
        expect(response.payload.id).toEqual(expect.any(String));
    });

    it('unauthenticated', async () => {
        const unauthenticatedClient = new Client();
        const response = await unauthenticatedClient.request(dashboard);

        expect(response.error.kind).toBe('Authentication');
        unauthenticatedClient.close();
    });

    it('missing name', async () => {
        const response = await client.request(omit(dashboard, 'name'));

        expect(response.error.kind).toBe('Validation');
    });

    it('empty name', async () => {
        const response = await client.request({ ...dashboard, name: '' });

        expect(response.error.kind).toBe('Validation');
    });

    it('missing config', async () => {
        const response = await client.request(omit(dashboard, 'name'));

        expect(response.error.kind).toBe('Validation');
    });

    it('empty config', async () => {
        const response = await client.request({ ...dashboard, config: '' });

        expect(response.error.kind).toBe('Validation');
    });

    afterAll(() => {
        client.close();
    });
});
