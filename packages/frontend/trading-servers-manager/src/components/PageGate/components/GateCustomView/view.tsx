import type { TGate } from '@frontend/common/src/types/domain/gates';
import type { ReactElement } from 'react';

import type { TCustomIndicatorsCommonProps } from '../../../CustomIndicators/CustomIndicators';
import { ETabName } from '../../../PageComponent/PageComponent';
import { TabCustomView } from '../../../Tabs/TabCustomView';

type TGateCustomViewProps = TCustomIndicatorsCommonProps & {
    gate: TGate;
};

export function GateCustomView(props: TGateCustomViewProps): ReactElement {
    const { gate } = props;
    return <TabCustomView key={ETabName.customView + gate.id} {...props} />;
}
