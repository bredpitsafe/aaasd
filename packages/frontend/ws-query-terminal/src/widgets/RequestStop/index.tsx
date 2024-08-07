import { StopOutlined } from '@ant-design/icons';
import {
    EWSQueryTerminalPageProps,
    EWSQueryTerminalSelectors,
} from '@frontend/common/e2e/selectors/ws-query-terminal/ws-query-terminal.page.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { useModule } from '@frontend/common/src/di/react';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import { isUndefined } from 'lodash-es';
import type { ComponentProps } from 'react';
import { memo } from 'react';

import { ERequestState, ModuleRequest } from '../../modules/request';

type TProps = TWithClassname & {
    size: ComponentProps<typeof Button>['size'];
    type: 'icon-label' | 'icon';
};

export const RequestStop = memo(({ className, type, size }: TProps) => {
    const { stopQuery, getRequestState } = useModule(ModuleRequest);

    const requestState = useSyncObservable(getRequestState());
    const inProgress =
        isUndefined(requestState) ||
        requestState === ERequestState.Requesting ||
        requestState === ERequestState.Receiving;

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
