import { LoadingOutlined } from '@ant-design/icons';
import { ICellRendererParams } from '@frontend/ag-grid';
import { isNil } from 'lodash-es';
import { memo, ReactElement } from 'react';

export const LoaderRenderer = memo((params: ICellRendererParams<string>): ReactElement => {
    if (isNil(params.data)) {
        return <LoadingOutlined />;
    }

    return <>{params.valueFormatted ?? params.value}</>;
});
