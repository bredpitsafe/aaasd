import { afterAll, describe, expect, it } from 'vitest';

import { Client } from './client/index.js';
import dashboard from './fixtures/dashboard.json';

describe('Load Testing', () => {
    const clients = Array.from({ length: 200 }, () => new Client({ authenticate: true }));

    afterAll(() => {});

    it('create and subscribe', async () => {
        const createPromises = clients.map((client) => client.request(dashboard));
        const dashboards = await Promise.all(createPromises);
        for (const dashboard of dashboards) {
            expect(dashboard.payload?.id).not.toBeUndefined();
        }

        const subscribePromises = dashboards.map((dashboard, i) =>
            clients[i].request({ type: 'SubscribeToDashboard', id: dashboard.payload.id }),
        );
        const fullDashboards = await Promise.all(subscribePromises);
        for (const dashboard of fullDashboards) {
            expect(dashboard.payload?.dashboard?.id).not.toBeUndefined();
        }
    }, 10_000);
});
