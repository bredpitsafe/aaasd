import cn from 'classnames';
import type { ReactElement } from 'react';

import type { TWithTest } from '../../../e2e';
import { pickTestProps } from '../../../e2e';
import type { TWithChildren, TWithClassname } from '../../types/components';
import type { TagProps } from '../Tag';
import { Tag } from '../Tag';
import { cnRoot } from './TableLabel.css';

export function TableLabel(
    props: TWithClassname &
        TWithChildren &
        TWithTest & {
            title?: string;
            color?: TagProps['color'];
            onClick?: VoidFunction;
        },
): ReactElement {
    return (
        <Tag
            {...pickTestProps(props)}
            title={props.title}
            className={cn(cnRoot, props.className)}
            color={props.color || 'blue'}
            onClick={props.onClick}
        >
            {props.children}
        </Tag>
    );
}
