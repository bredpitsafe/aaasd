import cn from 'classnames';
import type { ReactElement } from 'react';

import {
    ETableTabFilterProps,
    ETableTabFilterSelectors,
} from '../../../e2e/selectors/table-tab.filter.selectors';
import type { TWithChildren, TWithClassname } from '../../types/components';
import { cnRoot } from './TableLabels.css';

export function TableLabels(props: TWithClassname & TWithChildren): ReactElement {
    return (
        <div
            {...ETableTabFilterProps[ETableTabFilterSelectors.TableMenu]}
            className={cn(cnRoot, props.className)}
        >
            {props.children}
        </div>
    );
}
