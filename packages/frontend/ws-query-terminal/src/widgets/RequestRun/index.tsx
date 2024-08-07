import { CaretRightOutlined, SyncOutlined } from '@ant-design/icons';
import {
    EWSQueryTerminalPageProps,
    EWSQueryTerminalSelectors,
} from '@frontend/common/e2e/selectors/ws-query-terminal/ws-query-terminal.page.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { Space } from '@frontend/common/src/components/Space';
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

export const RequestRun = memo(({ className, type, size }: TProps) => {
    const { runQuery, stopQuery, getRequestState } = useModule(ModuleRequest);

    const requestState = useSyncObservable(getRequestState());
    const inProgress =
        isUndefined(requestState) ||
        requestState === ERequestState.Requesting ||
        requestState === ERequestState.Receiving;

    return (
        <Space>
            <Button
                {...EWSQueryTerminalPageProps[EWSQueryTerminalSelectors.RunRequestButton]}
                className={className}
                size={size}
                type="primary"
                icon={inProgress ? <SyncOutlined /> : <CaretRightOutlined />}
                title={inProgress ? 'Restart' : 'Run'}
                onClick={() => {
                    if (inProgress) {
                        stopQuery();
                    }

                    runQuery();
                }}
            >
                {type === 'icon' ? null : inProgress ? 'Restart' : 'Run'}
            </Button>
        </Space>
    );
});
