import type { editor } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { useEffect } from 'react';
type IStandaloneDiffEditor = editor.IStandaloneDiffEditor;
type IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

export function useFocusToLine(
    monaco: IStandaloneDiffEditor | IStandaloneCodeEditor,
    focusToLine?: number,
): void {
    useEffect(() => {
        if (focusToLine !== undefined) {
            monaco.revealLineNearTop(focusToLine);
        }
    }, [monaco, focusToLine]);
}
