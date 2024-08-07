import type { TDashboardItem } from '@grpc-schemas/dashboard_storage-api-sdk/services/dashboard_storage/v1/common';

import type { SubscribeToDashboardRequest } from '../../src/def/request.ts';
import type { CreateDashboardResponse } from '../../src/def/response.ts';
import type { Client } from '../client/index.ts';
import initialDashboard from '../fixtures/dashboard.json';

export async function createDashboard(client: Client) {
    return (await client.request(initialDashboard)).payload.id as CreateDashboardResponse['id'];
}

export async function getDashboard(client: Client, id: SubscribeToDashboardRequest['id']) {
    const response = await client.request({ type: 'SubscribeToDashboard', id });
    return response?.payload?.dashboard as TDashboardItem | undefined;
}
