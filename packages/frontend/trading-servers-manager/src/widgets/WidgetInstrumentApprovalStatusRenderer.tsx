import { CheckCircleOutlined } from '@ant-design/icons';
import type { TInstrument } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { Button } from '@frontend/common/src/components/Button.tsx';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { memo } from 'react';

import { ApprovalStatus } from '../components/Tables/ApprovalStatus.tsx';
import { useApproveInstruments } from './hooks/useApproveInstruments.tsx';
import {
    cnApproveStatusButton,
    cnApproveStatusButtonIcon,
    cnApproveStatusContainer,
} from './styles.css.ts';

export const WidgetInstrumentApprovalStatusRenderer = memo(
    ({ instrument, skipActions = false }: { instrument: TInstrument; skipActions?: boolean }) => {
        const approveInstruments = useApproveInstruments();

        const approveCurrentInstrument = useFunction(() => void approveInstruments([instrument]));

        if (instrument.approvalStatus !== 'INSTRUMENT_APPROVAL_STATUS_UNAPPROVED') {
            return <ApprovalStatus approvalStatus={instrument.approvalStatus} />;
        }

        return (
            <div className={cnApproveStatusContainer}>
                <ApprovalStatus approvalStatus={instrument.approvalStatus} />

                {!skipActions && (
                    <Button
                        className={cnApproveStatusButton}
                        title="Approve instrument"
                        icon={<CheckCircleOutlined className={cnApproveStatusButtonIcon} />}
                        shape="circle"
                        size="small"
                        onClick={approveCurrentInstrument}
                    />
                )}
            </div>
        );
    },
);
