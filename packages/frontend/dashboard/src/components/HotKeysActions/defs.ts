import type { KeyboardEvent } from 'react';

export type THotKey = Partial<
    Pick<KeyboardEvent, 'code' | 'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey'>
>;
export type THotKeyActionContext = {
    register<T>(
        command: string,
        hotKey: THotKey,
        updateSettings: (current: T | undefined) => T,
    ): VoidFunction;
    data: Record<string, unknown>;
};
