import { EContextTag, hasTag, TContextRef } from '../di';
import { ModuleRestartApp } from '../modules/actions/ModuleRestartApp.ts';

export function initResetTab(ctx: TContextRef): void {
    if (!hasTag(ctx, EContextTag.UI)) return;

    const { listen } = ModuleRestartApp(ctx);
    listen();
}
