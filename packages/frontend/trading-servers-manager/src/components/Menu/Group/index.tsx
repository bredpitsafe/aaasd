import type { TWithTest } from '@frontend/common/e2e';
import { Collapse } from '@frontend/common/src/components/Collapse';
import type { TComponentProps } from '@frontend/common/src/types/components';
import type { ReactElement, ReactNode } from 'react';

import { cnPanel } from './index.css';

const { Panel } = Collapse;

type TGroupViewProps = TComponentProps &
    TWithTest & {
        title: ReactNode;
        extra?: ReactNode;
    };

export function GroupView(props: TGroupViewProps): ReactElement {
    const { title, extra, children, ...restProps } = props;

    return (
        <div {...restProps}>
            <Collapse defaultActiveKey={[1]} expandIconPosition={'end'}>
                <Panel className={cnPanel} key={1} header={title} extra={extra}>
                    {children}
                </Panel>
            </Collapse>
        </div>
    );
}
