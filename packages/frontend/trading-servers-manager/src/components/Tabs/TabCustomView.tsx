import type { ReactElement } from 'react';

import type { TCustomIndicatorsProps } from '../CustomIndicators/CustomIndicators';
import { CustomIndicators } from '../CustomIndicators/CustomIndicators';
import { cnTab } from './styles.css';

export function TabCustomView(props: TCustomIndicatorsProps): ReactElement {
    return (
        <div className={cnTab}>
            <CustomIndicators {...props} />
        </div>
    );
}
