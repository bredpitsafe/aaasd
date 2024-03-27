import { ReactElement } from 'react';

import { CustomIndicators, TCustomIndicatorsProps } from '../CustomIndicators/CustomIndicators';
import { cnTab } from './styles.css';

export function TabCustomView(props: TCustomIndicatorsProps): ReactElement {
    return (
        <div className={cnTab}>
            <CustomIndicators {...props} />
        </div>
    );
}
