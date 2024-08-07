import type { TWithChildren } from '@frontend/common/src/types/components';
import { List } from 'antd';
import { isEmpty, isNil } from 'lodash-es';
import type { ReactElement, ReactNode } from 'react';

import type { TInnerTableProps } from '../InnerTableTooltip/view';
import { InnerTableTooltip } from '../InnerTableTooltip/view';
import { cnElement } from './view.css';

export const DEFAULT_LI_HEIGHT = 38;
export const DEFAULT_MINIMIZE_LENGTH = 6;

export function ListOfElements<T>({
    children,
    conditionToShowTable = DEFAULT_MINIMIZE_LENGTH,
    ...innerTableProps
}: TWithChildren &
    TInnerTableProps<T> & {
        conditionToShowTable?: number;
    }): ReactElement | null {
    if (isNil(children) || isEmpty(children)) {
        return null;
    }

    const childrenArray = Array.isArray(children) ? children : [children];

    if (childrenArray.length > conditionToShowTable) {
        return <InnerTableTooltip<T> {...innerTableProps} />;
    }

    return (
        <List
            dataSource={childrenArray}
            renderItem={(item: ReactNode) => <List.Item className={cnElement}>{item}</List.Item>}
            bordered={false}
            size="small"
        />
    );
}
