import { SubscribeToDashboardRequest } from '../../src/def/request.js';
import { CreateDashboardResponse, DashboardItem } from '../../src/def/response.js';
import type { Client } from '../client/index.js';
import initialDashboard from '../fixtures/dashboard.json';

export async function createDashboard(client: Client) {
    return (await client.request(initialDashboard)).payload.id as CreateDashboardResponse['id'];
}

export async function getDashboard(client: Client, id: SubscribeToDashboardRequest['id']) {
    const response = await client.request({ type: 'SubscribeToDashboard', id });
    return response?.payload?.dashboard as DashboardItem | undefined;
}
