import { attachTag, EContextTag, TContextRef } from '../di';
import { initResetTab } from './resetTab';

export function initContextUI(ctx: TContextRef): void {
    attachTag(ctx, EContextTag.UI);
    initResetTab(ctx);
}
