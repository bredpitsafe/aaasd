import { ETable } from '../../src/db/constants.ts';
import { client } from '../../src/db/postgres/index.ts';

export async function clearDashboards() {
    const query = {
        query: `DELETE FROM ${ETable.Dashboards} WHERE 1=1`,
    };

    await client.query(query);
}
