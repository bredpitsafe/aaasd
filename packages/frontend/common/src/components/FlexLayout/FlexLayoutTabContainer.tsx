import cn from 'classnames';
import type { TabNode } from 'flexlayout-react';

import { createTestProps } from '../../../e2e';
import { ELayoutSelectors } from '../../../e2e/selectors/layout.selectors.ts';
import type { TPageLayoutFactory } from '../../modules/layouts/data.ts';
import type { TWithClassname } from '../../types/components.ts';
import { Error } from '../Error/view.tsx';
import { TabNodeRenderer } from '../TabNodeRenderer/TabNodeRenderer.tsx';
import { cnContainer } from './view.css.ts';

type TFlexLayoutTabContainerProps = TWithClassname & {
    node: TabNode;
    factory?: TPageLayoutFactory;
    timeout: number;
};

export const FlexLayoutTabContainer = (props: TFlexLayoutTabContainerProps) => {
    const { className, node, factory, timeout } = props;
    const id = node.getId();
    const visible = node.isVisible();
    return (
        <TabNodeRenderer visible={visible} timeout={timeout}>
            <div
                className={cn(cnContainer, className)}
                {...createTestProps(`${ELayoutSelectors.LayoutTab}_${id}`)}
            >
                {factory ? (
                    factory(node)
                ) : (
                    <Error status={404} title="Component factory not provided" />
                )}
            </div>
        </TabNodeRenderer>
    );
};
