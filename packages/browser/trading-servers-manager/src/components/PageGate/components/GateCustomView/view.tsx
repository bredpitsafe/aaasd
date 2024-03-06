import { TGate } from '@frontend/common/src/types/domain/gates';
import { ReactElement } from 'react';

import { ICustomIndicatorsCommonProps } from '../../../CustomIndicators/CustomIndicators';
import { ETabName } from '../../../PageComponent/PageComponent';
import { TabCustomView } from '../../../Tabs/TabCustomView';

type TGateCustomViewProps = ICustomIndicatorsCommonProps & {
    gate: TGate;
};

export function GateCustomView(props: TGateCustomViewProps): ReactElement {
    const { gate } = props;
    return <TabCustomView key={ETabName.customView + gate.id} {...props} />;
}
