import cn from 'classnames';
import { ReactElement } from 'react';

import { createTestProps } from '../../../e2e';
import { ETableTabFilterSelectors } from '../../../e2e/selectors/table-tab.filter.selectors';
import { TWithChildren, TWithClassname } from '../../types/components';
import { cnRoot } from './TableLabels.css';

export function TableLabels(props: TWithClassname & TWithChildren): ReactElement {
    return (
        <div
            {...createTestProps(ETableTabFilterSelectors.TableMenu)}
            className={cn(cnRoot, props.className)}
        >
            {props.children}
        </div>
    );
}
