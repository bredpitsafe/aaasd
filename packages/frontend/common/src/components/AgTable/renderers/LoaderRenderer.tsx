import { LoadingOutlined } from '@ant-design/icons';
import type { ICellRendererParams } from '@frontend/ag-grid';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { memo } from 'react';

export const LoaderRenderer = memo((params: ICellRendererParams<string>): ReactElement => {
    if (isNil(params.data)) {
        return <LoadingOutlined />;
    }

    return <>{params.valueFormatted ?? params.value}</>;
});
