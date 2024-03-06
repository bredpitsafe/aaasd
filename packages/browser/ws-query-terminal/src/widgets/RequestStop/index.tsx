import { StopOutlined } from '@ant-design/icons';
import {
    EWSQueryTerminalPageProps,
    EWSQueryTerminalSelectors,
} from '@frontend/common/e2e/selectors/ws-query-terminal/ws-query-terminal.page.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { useModule } from '@frontend/common/src/di/react';
import { TWithClassname } from '@frontend/common/src/types/components';
import { useValueDescriptorObservableDeprecated } from '@frontend/common/src/utils/React/useValueDescriptorObservableDeprecated';
import { isSyncDesc, isUnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { isUndefined } from 'lodash-es';
import { ComponentProps, memo } from 'react';

import { ModuleRequest } from '../../modules/request';

type TProps = TWithClassname & {
    size: ComponentProps<typeof Button>['size'];
    type: 'icon-label' | 'icon';
};

export const RequestStop = memo(({ className, type, size }: TProps) => {
    const { stopQuery, getRequestState } = useModule(ModuleRequest);

    const requestState = useValueDescriptorObservableDeprecated(getRequestState());
    const inProgress =
        isUndefined(requestState) || isSyncDesc(requestState) || isUnscDesc(requestState);

    return (
        <Button
            {...EWSQueryTerminalPageProps[EWSQueryTerminalSelectors.StopRequestButton]}
            className={className}
            size={size}
            icon={<StopOutlined />}
            title={'Stop Request'}
            onClick={stopQuery}
            disabled={!inProgress}
        >
            {type === 'icon' ? null : 'Stop'}
        </Button>
    );
});
