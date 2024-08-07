import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { memo } from 'react';

import type { directionNumber2Display } from '../utils';
import { cnNegativeChange, cnPositiveChange } from '../view.css';

export const DirectionCellRenderer = memo(
    ({ value }: { value: ReturnType<typeof directionNumber2Display> }) => {
        switch (value) {
            case 'Up':
                return <ArrowUpOutlined className={cnPositiveChange} />;
            case 'Down':
                return <ArrowDownOutlined className={cnNegativeChange} />;
            default:
                return null;
        }
    },
);
