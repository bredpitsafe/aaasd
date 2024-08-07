import { isNil } from 'lodash-es';
import type { editor } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { Range } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { useEffect, useMemo, useRef } from 'react';

import { EMPTY_ARRAY } from '../../../utils/const';
import { useFunction } from '../../../utils/React/useFunction';
import type { TEditorProps } from '../types';

export function useHighlightLinesDecoration(
    codeEditor: editor.ICodeEditor,
    highlightLines: TEditorProps['highlightLines'],
) {
    const decorationsRef = useRef<string[]>(EMPTY_ARRAY);

    const updateDecorations = useFunction(
        (start: number, end: number) =>
            (decorationsRef.current = codeEditor.deltaDecorations(decorationsRef.current, [
                {
                    range: new Range(start, 1, end, 1),
                    options: {
                        isWholeLine: true,
                        linesDecorationsClassName: 'highlight-line-decoration',
                    },
                },
            ])),
    );

    const { start, end } = useMemo(
        () => ({
            start: highlightLines?.start ?? highlightLines?.end,
            end: highlightLines?.end ?? highlightLines?.start,
        }),
        [highlightLines?.start, highlightLines?.end],
    );

    useEffect(() => {
        if (isNil(start) || isNil(end)) {
            decorationsRef.current = codeEditor.deltaDecorations(decorationsRef.current, []);
            return;
        }

        updateDecorations(start, end);

        const disposableModelContentChanged = codeEditor.onDidChangeModelContent(() => {
            updateDecorations(start, end);
        });

        return () => disposableModelContentChanged.dispose();
    }, [codeEditor, highlightLines, updateDecorations, start, end]);
}
