import { SaveOutlined } from '@ant-design/icons';
import type { ReactElement } from 'react';
import { memo } from 'react';

import { cnDirtyIcon } from '../style.css';

export const KindWithCellRenderer = memo(
    ({ kind, dirty }: { kind: string; dirty?: boolean }): ReactElement => (
        <>
            {dirty && <SaveOutlined className={cnDirtyIcon} />}
            {kind}
        </>
    ),
);
