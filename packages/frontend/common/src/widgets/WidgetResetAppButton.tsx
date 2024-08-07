import type { ReactElement } from 'react';
import { from } from 'rxjs';
import { tap } from 'rxjs/operators';

import type { TWithTest } from '../../e2e';
import { pickTestProps } from '../../e2e';
import type { ButtonProps } from '../components/Button';
import { Button } from '../components/Button';
import { useModule } from '../di/react';
import { ModuleModals } from '../lib/modals';
import type { TWithClassname } from '../types/components';
import { useObservableFunction } from '../utils/React/useObservableFunction';

export function WidgetResetAppButton(
    props: TWithClassname & TWithTest & ButtonProps,
): ReactElement {
    const { confirm } = useModule(ModuleModals);
    const [handleRestart] = useObservableFunction(() => {
        return from(confirm('Tab will be restarted, proceed?')).pipe(
            tap((result) => {
                if (result) self.location.reload();
            }),
        );
    });

    return (
        <Button title="Reset Cache" onClick={handleRestart} {...pickTestProps(props)} {...props}>
            Reset Cache
        </Button>
    );
}
