import { Tag } from '@frontend/common/src/components/Tag';
import { isNil } from 'lodash-es';
import { memo, ReactElement } from 'react';

import { EHerodotusTaskType } from '../../../types/domain';
import { cnType } from './TaskTypeRenderer.css';

type TTypeRendererProps = {
    value?: EHerodotusTaskType;
};

export const TaskTypeRenderer = memo((props: TTypeRendererProps): ReactElement | null => {
    const { value: type } = props;

    if (isNil(type)) {
        return null;
    }

    const color =
        type === EHerodotusTaskType.Sell
            ? 'red'
            : type === EHerodotusTaskType.Buy
              ? 'green'
              : 'gold';

    return (
        <Tag className={cnType} color={color}>
            {type}
        </Tag>
    );
});
