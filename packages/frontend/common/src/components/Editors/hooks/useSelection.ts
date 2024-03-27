import { isNil } from 'lodash-es';
import { editor, Selection } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { useEffect, useMemo } from 'react';

import type { TEditorProps } from '../types';

export function useSelection(
    codeEditor: editor.ICodeEditor,
    selection: TEditorProps['selection'],
    onChangeSelection: TEditorProps['onChangeSelection'],
) {
    const memoizedSelection = useMemo(
        () => selection,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selection?.startColumn, selection?.startLine, selection?.endColumn, selection?.endLine],
    );

    useEffect(() => {
        if (!isNil(memoizedSelection)) {
            codeEditor.setSelection(
                new Selection(
                    memoizedSelection.startLine,
                    memoizedSelection.startColumn,
                    memoizedSelection.endLine,
                    memoizedSelection.endColumn,
                ),
            );
        }

        if (isNil(onChangeSelection)) {
            return;
        }

        const disposableCursorChanged = codeEditor.onDidChangeCursorSelection(({ reason }) => {
            if (reason === editor.CursorChangeReason.ContentFlush) {
                return;
            }

            const selection = codeEditor.getSelection();

            if (isNil(selection)) {
                onChangeSelection(null);
            } else {
                onChangeSelection({
                    startLine: selection.selectionStartLineNumber,
                    startColumn: selection.selectionStartColumn,
                    endLine: selection.positionLineNumber,
                    endColumn: selection.positionColumn,
                });
            }
        });

        const disposableModelContentChanged = codeEditor.onDidChangeModelContent(() => {
            if (isNil(memoizedSelection)) {
                codeEditor.setSelection(new Selection(0, 0, 0, 0));
            } else {
                codeEditor.setSelection(
                    new Selection(
                        memoizedSelection.startLine,
                        memoizedSelection.startColumn,
                        memoizedSelection.endLine,
                        memoizedSelection.endColumn,
                    ),
                );
            }
        });

        return () => {
            disposableCursorChanged.dispose();
            disposableModelContentChanged.dispose();
        };
    }, [codeEditor, memoizedSelection, onChangeSelection]);
}
