import { ETables } from './constants.ts';
import { client } from './postgres/index.ts';

export async function checkDatabaseConnection(): Promise<void> {
    await client.query({
        query: `SELECT * FROM ${ETables.Dashboards} LIMIT 1`,
    });
}
