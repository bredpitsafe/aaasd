import type { ISO } from '@common/types';

export enum EComponentStateEditorStateSource {
    User = 'User',
    System = 'System',
    Editor = 'Editor',
}

export type TEditorState = {
    source: EComponentStateEditorStateSource;
    revision: ISO;
    selection?: {
        startLine: number;
        startColumn: number;
        endLine: number;
        endColumn: number;
    };
};
