import { ReactElement } from 'react';
import { from } from 'rxjs';
import { tap } from 'rxjs/operators';

import { pickTestProps, TWithTest } from '../../e2e';
import { Button, ButtonProps } from '../components/Button';
import { useModule } from '../di/react';
import { useTraceId } from '../hooks/useTraceId';
import { ModuleModals } from '../lib/modals';
import { ModuleRestartApp } from '../modules/actions/ModuleRestartApp';
import { TWithClassname } from '../types/components';
import { useObservableFunction } from '../utils/React/useObservableFunction';

export function WidgetResetAppButton(
    props: TWithClassname & TWithTest & ButtonProps,
): ReactElement {
    const traceId = useTraceId();
    const { confirm } = useModule(ModuleModals);
    const { restart } = useModule(ModuleRestartApp);
    const [handleRestart] = useObservableFunction(() => {
        return from(confirm('Are you sure it will restart all tabs?')).pipe(
            tap((result) => {
                if (result) restart(traceId);
            }),
        );
    });

    return (
        <Button title="Reset Cache" onClick={handleRestart} {...pickTestProps(props)} {...props}>
            Reset Cache
        </Button>
    );
}
