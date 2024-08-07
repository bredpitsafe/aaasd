import { Age } from '@frontend/common/src/components/Age';
import { BaseTimeContext } from '@frontend/common/src/components/BaseTimeContext';
import type { TActiveOrder } from '@frontend/common/src/types/domain/orders';
import type { ReactElement } from 'react';

type TAgeRendererProps = Pick<TActiveOrder, 'platformTime'>;

export function AgeRenderer(props: TAgeRendererProps): ReactElement | null {
    if (props.platformTime === undefined) {
        return null;
    }

    return (
        <BaseTimeContext.Consumer>
            {(time) => <Age timestamp={props.platformTime} baseTime={time} />}
        </BaseTimeContext.Consumer>
    );
}
