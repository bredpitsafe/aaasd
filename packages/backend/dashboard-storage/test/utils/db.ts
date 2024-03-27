import { ETables } from '../../src/db/constants.js';
import { client } from '../../src/db/postgres/index.js';

export async function clearDashboards() {
    const query = {
        query: `DELETE FROM ${ETables.Dashboards} WHERE 1=1`,
    };

    await client.query(query);
}
