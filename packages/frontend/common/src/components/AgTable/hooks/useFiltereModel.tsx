import type { GridApi } from '@frontend/ag-grid';
import { useEffect, useState } from 'react';

import { EMPTY_OBJECT } from '../../../utils/const';
import { useFunction } from '../../../utils/React/useFunction';
import { useGridApiEvent } from './useGridApiEvent';

export function useFilterModel<FilterModel extends {}>(
    api: GridApi | undefined,
    merge: (originalModel: FilterModel, newModel: FilterModel) => FilterModel,
): [FilterModel, (getModel: (model: FilterModel) => FilterModel) => void] {
    const [model, setModel] = useState<FilterModel>(EMPTY_OBJECT);
    const updateModel = useFunction((getModel: (model: FilterModel) => FilterModel) => {
        const nextModel = getModel({ ...model });
        setModel(nextModel);

        api?.setFilterModel(nextModel);
    });
    const onChanged = useFunction(() => {
        if (api === undefined) return;

        const currentModel = api.getFilterModel() as FilterModel;

        currentModel !== model && setModel(currentModel);
    });

    useGridApiEvent(api, onChanged, 'filterChanged');
    useEffect(() => {
        if (api === undefined) return;

        updateModel((model) => merge(model, api.getFilterModel() as FilterModel));
    }, [api, updateModel, merge]);

    return [model, updateModel];
}
