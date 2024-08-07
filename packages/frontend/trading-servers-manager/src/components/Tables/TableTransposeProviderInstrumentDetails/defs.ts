import type { EPropertyGroup } from '../defs.ts';

export type TOverrideError =
    | { group: EPropertyGroup; property: string; error: string }
    | { group: undefined; property: undefined; error: string };
