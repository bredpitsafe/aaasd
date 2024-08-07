import type { ReactElement } from 'react';

import type { ResultProps } from '../Result';
import { Result } from '../Result';
import { cnRoot } from './view.css';

export type TErrorProps = ResultProps;

export function Error(props: TErrorProps): ReactElement {
    const { status = '404', title = 'Error', subTitle, ...restProps } = props;
    return (
        <div className={cnRoot}>
            <Result status={status} title={title} subTitle={subTitle} {...restProps} />
        </div>
    );
}
