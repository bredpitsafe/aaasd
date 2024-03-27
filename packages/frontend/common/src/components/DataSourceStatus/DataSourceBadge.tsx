import { WifiOutlined } from '@ant-design/icons';
import { ReactElement } from 'react';

import { EDataSourceLevel } from '../../modules/dataSourceStatus/defs';
import type { TWithClassname } from '../../types/components';
import { Button } from '../Button';
import { getColorByLevel } from './utils';

export function DataSourceBadge(
    props: TWithClassname & {
        level?: EDataSourceLevel;
        title?: string;
        onClick: VoidFunction;
    },
): ReactElement {
    return (
        <Button
            type="text"
            className={props.className}
            icon={<WifiOutlined style={{ color: getColorByLevel(props.level) }} />}
            title={props.title}
            onClick={props.onClick}
        />
    );
}
