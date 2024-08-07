import { isNil } from 'lodash-es';
import type { ComponentProps, ComponentType, ReactNode } from 'react';
import { memo, useEffect, useState } from 'react';

export function asyncHOC<TComponent extends ComponentType<any>>(
    asyncComponent: () => Promise<TComponent>,
) {
    return memo((props: ComponentProps<TComponent> & { children?: ReactNode }) => {
        const [Component, setComponent] = useState<TComponent | undefined>(undefined);

        useEffect(
            () => void asyncComponent().then((component) => setComponent(() => component)),
            [],
        );

        const { children, ...restProps } = props;

        return isNil(Component) ? (
            children ?? null
        ) : (
            <Component {...(restProps as ComponentProps<TComponent>)} />
        );
    });
}
