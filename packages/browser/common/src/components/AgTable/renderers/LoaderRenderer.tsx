import { LoadingOutlined } from '@ant-design/icons';
import { ICellRendererParams } from 'ag-grid-community/dist/lib/rendering/cellRenderers/iCellRenderer';
import { isNil } from 'lodash-es';
import { memo, ReactElement } from 'react';

export const LoaderRenderer = memo((params: ICellRendererParams): ReactElement => {
    if (isNil(params.data)) {
        return <LoadingOutlined />;
    }

    return <>{params.valueFormatted ?? params.value}</>;
});
