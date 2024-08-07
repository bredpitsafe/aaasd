import { ETable } from './constants.ts';
import { client } from './postgres/index.ts';

export async function checkDatabaseConnection(): Promise<void> {
    await client.query({
        query: `SELECT * FROM ${ETable.Dashboards} LIMIT 1`,
    });
}
