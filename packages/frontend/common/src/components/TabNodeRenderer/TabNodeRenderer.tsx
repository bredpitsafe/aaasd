import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { useTimeout } from 'react-use';

import type { TWithChild } from '../../types/components';

type TTabNodeRendererProps = TWithChild & {
    visible: boolean;
    timeout: number;
};

export const TabNodeRenderer = (props: TTabNodeRendererProps): ReactElement => {
    const { timeout, visible, children } = props;
    const [isReady, cancel, reset] = useTimeout(timeout);

    useEffect(() => {
        if (visible) {
            cancel();
        } else {
            reset();
        }

        return reset;
    }, [cancel, visible, reset]);

    return <>{visible || !isReady() ? children : null}</>;
};
