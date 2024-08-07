import type { ColDef, ICellEditorParams } from '@frontend/ag-grid';
import type { ICellEditorReactComp } from 'ag-grid-react';
import { isEmpty, isFunction, isObject } from 'lodash-es';
import { Component } from 'react';

import { cnReadOnlyEditor } from './style.css';

export class ReadOnlyEditor extends Component implements ICellEditorReactComp {
    private params: ICellEditorParams;
    constructor(params: ICellEditorParams) {
        super(params);
        this.params = params;
    }

    getValue(): string {
        return this.params?.value ?? '';
    }

    isPopup(): boolean {
        return true;
    }

    isCancelBeforeStart(): boolean {
        return isEmpty(this.params?.value);
    }

    isCancelAfterEnd(): boolean {
        return true;
    }

    render() {
        const cellRenderer = this.params?.colDef?.cellRenderer;

        if (isFunction(cellRenderer)) {
            return <div className={cnReadOnlyEditor}>{cellRenderer(this.params)}</div>;
        }

        const value = this.params?.value;

        if (isObject(value)) {
            return <pre className={cnReadOnlyEditor}>{JSON.stringify(value, null, 2)}</pre>;
        }

        return <div className={cnReadOnlyEditor}>{value}</div>;
    }
}

export function withReadOnlyEditor<T extends object>(): Pick<
    ColDef<T>,
    'cellEditor' | 'cellEditorPopup' | 'editable'
> {
    return {
        editable: true,
        cellEditorPopup: true,
        cellEditor: ReadOnlyEditor,
    };
}
