import cn from 'classnames';
import type { ReactElement } from 'react';

import type { TWithChildren, TWithClassname } from '../types/components';
import { cnDisabled } from './Disabled.css';

export type TDisabledViewProps = TWithChildren & TWithClassname & { disabled: boolean };

export function DisabledView(props: TDisabledViewProps): ReactElement {
    const { className, disabled, children } = props;
    const finalClassName = cn(className, {
        [cnDisabled]: disabled,
    });

    return <div className={finalClassName}>{children}</div>;
}
