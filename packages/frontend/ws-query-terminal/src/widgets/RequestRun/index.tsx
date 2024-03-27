import { CaretRightOutlined, SyncOutlined } from '@ant-design/icons';
import {
    EWSQueryTerminalPageProps,
    EWSQueryTerminalSelectors,
} from '@frontend/common/e2e/selectors/ws-query-terminal/ws-query-terminal.page.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { Space } from '@frontend/common/src/components/Space';
import { Switch } from '@frontend/common/src/components/Switch';
import { useModule } from '@frontend/common/src/di/react';
import { TWithClassname } from '@frontend/common/src/types/components';
import { useValueDescriptorObservableDeprecated } from '@frontend/common/src/utils/React/useValueDescriptorObservableDeprecated';
import { isSyncDesc, isUnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { isUndefined } from 'lodash-es';
import { ComponentProps, memo, useState } from 'react';

import { ModuleRequest } from '../../modules/request';

type TProps = TWithClassname & {
    size: ComponentProps<typeof Button>['size'];
    type: 'icon-label' | 'icon';
};

export const RequestRun = memo(({ className, type, size }: TProps) => {
    const { runQuery, stopQuery, getRequestState } = useModule(ModuleRequest);
    const [shouldUseWorker, setShouldUseWorker] = useState(false);

    const requestState = useValueDescriptorObservableDeprecated(getRequestState());
    const inProgress =
        isUndefined(requestState) || isSyncDesc(requestState) || isUnscDesc(requestState);

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

                    runQuery({ shouldUseWorker });
                }}
            >
                {type === 'icon' ? null : inProgress ? 'Restart' : 'Run'}
            </Button>
            <Switch
                {...EWSQueryTerminalPageProps[EWSQueryTerminalSelectors.RequestSwitch]}
                checkedChildren="Worker"
                unCheckedChildren="Tab"
                checked={shouldUseWorker}
                onChange={setShouldUseWorker}
                disabled={inProgress}
            />
        </Space>
    );
});
