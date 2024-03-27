import { Tag } from '@frontend/common/src/components/Tag';
import { ESide } from '@frontend/common/src/types/domain/task';
import { isNil } from 'lodash-es';
import { memo, ReactElement } from 'react';

import { cnType } from './TaskTypeRenderer.css';

type TTypeRendererProps = {
    value?: ESide;
};

export const TaskTypeRenderer = memo((props: TTypeRendererProps): ReactElement | null => {
    const { value: type } = props;

    if (isNil(type)) {
        return null;
    }

    const color = type === ESide.Sell ? 'red' : type === ESide.Buy ? 'green' : 'gold';

    return (
        <Tag className={cnType} color={color}>
            {type}
        </Tag>
    );
});
