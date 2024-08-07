import type { TContextRef } from '../di';
import { ModuleClientTableFilters } from '../modules/clientTableFilters';
import { ModuleNotifications } from '../modules/notifications/module';

export async function initTableFiltersEffects(ctx: TContextRef): Promise<void> {
    const { initFilterDatabase } = ModuleClientTableFilters(ctx);
    const { error } = ModuleNotifications(ctx);
    await initFilterDatabase(error);
}
