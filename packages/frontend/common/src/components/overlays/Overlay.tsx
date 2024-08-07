import cn from 'classnames';
import type { ReactElement } from 'react';

import type { TWithChildren, TWithClassname } from '../../types/components';
import { cnContainer } from './Overlay.css';

export type TOverlayProps = TWithClassname & TWithChildren;

export const Overlay = (props: TOverlayProps): ReactElement => {
    return <div className={cn(cnContainer, props.className)}>{props.children}</div>;
};
