import { FileAddOutlined } from '@ant-design/icons';
import { ENavType } from '@frontend/common/src/actors/Settings/types';
import { Button } from '@frontend/common/src/components/Button';
import { useModule } from '@frontend/common/src/di/react';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { memo } from 'react';

import { ModuleFillManualTransferAction } from '../../modules/actions/ModuleFillManualTransferAction';
import { WidgetCoinSelector } from '../WidgetCoinSelector';

const TITLE = 'New Manual Transfer';

export const BalanceMonitorAdditionalControls = memo(
    ({ className, type }: TWithClassname & { type: ENavType }) => {
        const { fillManualTransfer } = useModule(ModuleFillManualTransferAction);

        const handleAddManualEmptyTransfer = useFunction(() => fillManualTransfer());

        if (type === ENavType.Hidden) {
            return null;
        }

        return (
            <div className={className}>
                <Button
                    title={type === ENavType.Small ? TITLE : undefined}
                    icon={<FileAddOutlined />}
                    onClick={handleAddManualEmptyTransfer}
                >
                    {type === ENavType.Full ? TITLE : undefined}
                </Button>

                <WidgetCoinSelector
                    size="middle"
                    type={type === ENavType.Small ? 'icon' : 'icon-label'}
                />
            </div>
        );
    },
);
