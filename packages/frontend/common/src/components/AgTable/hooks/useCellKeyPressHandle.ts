import type { CellKeyDownEvent, GridOptions } from '@frontend/ag-grid';
import { isEmpty } from 'lodash-es';
import { useMemo } from 'react';

import { clipboardWrite } from '../../../utils/clipboard';
import { getCellValue } from '../utils';

export function useCellKeyPressHandle<T>(
    onCellKeyDown: GridOptions<T>['onCellKeyDown'],
): GridOptions<T>['onCellKeyDown'] {
    return useMemo(
        () =>
            onCellKeyDown ??
            ((event: CellKeyDownEvent<T>) => {
                if (!(event.event instanceof KeyboardEvent)) {
                    return;
                }

                const { event: keyboardEvent } = event;

                if (
                    (keyboardEvent.key?.toUpperCase() !== 'C' && keyboardEvent.code !== 'KeyC') ||
                    !keyboardEvent.shiftKey ||
                    (!keyboardEvent.metaKey && !keyboardEvent.ctrlKey)
                ) {
                    return;
                }

                // [Ctrl] + [⇧] + [C] or [⌘] + [⇧] + [C]

                const cellData = getCellValue(event);

                if (!isEmpty(cellData)) {
                    void clipboardWrite(cellData!);
                }
            }),
        [onCellKeyDown],
    );
}
