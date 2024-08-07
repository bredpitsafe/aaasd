export function getSelectionData<T>(getData: () => T[] | undefined): T[] {
    // Get current selection.
    const selection = document.getSelection();

    if (selection === null || selection.rangeCount === 0) {
        return [];
    }
    const selectionContents = selection.getRangeAt(0).cloneContents();

    return selectionContents !== undefined
        ? Array.from(
              Array.from(selectionContents.children).reduce((acc, element) => {
                  if (element instanceof HTMLElement && element.dataset.rowIndex !== undefined) {
                      const data = getData();

                      const record = data?.[Number(element.dataset.rowIndex)];
                      if (record !== undefined) {
                          acc.add(record);
                      }
                  }
                  return acc;
              }, new Set<T>()),
          )
        : [];
}

type TRowIndexAttribute = {
    'data-row-index': number;
};

export function getRowIndexAttribute(rowIndex: number): TRowIndexAttribute {
    return {
        'data-row-index': rowIndex,
    };
}
