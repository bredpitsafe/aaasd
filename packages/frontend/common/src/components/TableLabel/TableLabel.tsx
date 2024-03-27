import cn from 'classnames';
import { ReactElement } from 'react';

import { pickTestProps, TWithTest } from '../../../e2e';
import { TWithChildren, TWithClassname } from '../../types/components';
import { Tag, TagProps } from '../Tag';
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
