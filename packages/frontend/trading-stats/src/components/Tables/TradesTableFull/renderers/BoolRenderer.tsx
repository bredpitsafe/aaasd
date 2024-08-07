import { CheckOutlined, StopOutlined } from '@ant-design/icons';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { memo, useMemo } from 'react';

import { cnFalse, cnTrue } from './BoolRenderer.css';

type TBoolRendererProps = {
    value?: boolean;
};

export const BoolRenderer = memo((props: TBoolRendererProps): ReactElement | null => {
    const { value } = props;
    const className = useMemo(() => (value === true ? cnTrue : cnFalse), [value]);

    if (isNil(value)) {
        return null;
    }

    return value ? <CheckOutlined className={className} /> : <StopOutlined className={className} />;
});
