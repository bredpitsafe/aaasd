import type { IScrollEvent } from 'monaco-editor/esm/vs/editor/editor.api.js';

export enum ComponentTabKey {
    Config = 'config',
    State = 'state',
    CustomView = 'custom-view',
    Menu = 'menu',
}

export type TScrollData = Pick<IScrollEvent, 'scrollTop'>;

export interface IDraftValueWithDigest {
    value: string;
    digest?: string;
}
export type TDraftValue = string | IDraftValueWithDigest;

export type TComponentDrafts<T extends TDraftValue = TDraftValue> = Record<ComponentTabKey, T>;
export type TComponentScrollPosition = Record<ComponentTabKey, TScrollData>;
