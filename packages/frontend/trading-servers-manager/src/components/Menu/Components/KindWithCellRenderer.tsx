import { SaveOutlined } from '@ant-design/icons';
import { memo, ReactElement } from 'react';

import { cnDirtyIcon } from '../style.css';

export const KindWithCellRenderer = memo(
    ({ kind, dirty }: { kind: string; dirty?: boolean }): ReactElement => (
        <>
            {dirty && <SaveOutlined className={cnDirtyIcon} />}
            {kind}
        </>
    ),
);
