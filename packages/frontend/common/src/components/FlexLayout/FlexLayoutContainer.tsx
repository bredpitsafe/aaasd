import cn from 'classnames';
import type { ILayoutProps, Layout } from 'flexlayout-react';
import { isNil } from 'lodash-es';
import type { ForwardedRef, ReactElement } from 'react';
import { forwardRef } from 'react';

import { pickTestProps } from '../../../e2e';
import type { TWithClassname } from '../../types/components.ts';
import { ErrorBoundary } from '../ErrorBoundary.tsx';
import { LoadingOverlay } from '../overlays/LoadingOverlay.tsx';
import { FlexLayout } from './index.tsx';
import { cnContainer } from './view.css.ts';

type TFlexLayoutContainerProps = Partial<ILayoutProps> & TWithClassname;

export const FlexLayoutContainer = forwardRef(
    (props: TFlexLayoutContainerProps, ref: ForwardedRef<Layout>): ReactElement => {
        const { model, factory, className, ...restProps } = props;

        return (
            <ErrorBoundary>
                <div className={cn(cnContainer, className)} {...pickTestProps(props)}>
                    {!isNil(model) && !isNil(factory) ? (
                        <FlexLayout model={model} factory={factory} {...restProps} ref={ref} />
                    ) : (
                        <LoadingOverlay text="Loading layout..." />
                    )}
                </div>
            </ErrorBoundary>
        );
    },
);
