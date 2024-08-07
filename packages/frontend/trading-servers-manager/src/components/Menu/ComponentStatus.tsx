import { gold } from '@ant-design/colors';
import {
    CloseCircleFilled,
    ExclamationCircleOutlined,
    MinusCircleFilled,
    PauseCircleFilled,
    PlayCircleFilled,
    PlusCircleFilled,
    QuestionCircleFilled,
    QuestionCircleOutlined,
    SyncOutlined,
} from '@ant-design/icons';
import type { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon';
import { StatusMessage } from '@frontend/common/src/components/StatusMessage';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import { EComponentStatus } from '@frontend/common/src/types/domain/component';
import { blue, green, grey, orange, red, yellow } from '@frontend/common/src/utils/colors';
import type { ComponentType, FunctionComponent, ReactElement } from 'react';

import { cnIcon, cnStatus, cnStatusMessage, cnTooltip } from './ComponentStatus.css';

const mapStatusToIcon: Record<EComponentStatus, FunctionComponent> = {
    [EComponentStatus.Initializing]: PlusCircleFilled,
    [EComponentStatus.Enabled]: PlayCircleFilled,
    [EComponentStatus.Alarming]: PlayCircleFilled,
    [EComponentStatus.Terminating]: MinusCircleFilled,
    [EComponentStatus.Disabled]: PauseCircleFilled,
    [EComponentStatus.Failed]: CloseCircleFilled,
    [EComponentStatus.Rejected]: ExclamationCircleOutlined,
    [EComponentStatus.Unknown]: QuestionCircleFilled,
};
const mapStatusToFill: Record<EComponentStatus, string> = {
    [EComponentStatus.Initializing]: gold[6],
    [EComponentStatus.Enabled]: green[6],
    [EComponentStatus.Alarming]: yellow[6],
    [EComponentStatus.Terminating]: blue[6],
    [EComponentStatus.Disabled]: grey[5],
    [EComponentStatus.Failed]: red[6],
    [EComponentStatus.Rejected]: red[3],
    [EComponentStatus.Unknown]: grey[9],
};

const mapStatusToTooltipFill: Record<EComponentStatus, string> = {
    [EComponentStatus.Initializing]: blue[6],
    [EComponentStatus.Enabled]: green[6],
    [EComponentStatus.Alarming]: orange[6],
    [EComponentStatus.Terminating]: blue[6],
    [EComponentStatus.Disabled]: grey[5],
    [EComponentStatus.Failed]: red[6],
    [EComponentStatus.Rejected]: red[3],
    [EComponentStatus.Unknown]: grey[3],
};

export function ComponentStatus({
    loading,
    status,
    statusMessage,
}: {
    loading?: boolean;
    status: EComponentStatus;
    statusMessage?: null | string;
}): ReactElement {
    const Icon = loading
        ? SyncOutlined
        : ((mapStatusToIcon[status] || QuestionCircleOutlined) as ComponentType<AntdIconProps>);
    const fill = mapStatusToFill[status] || red[7];
    const tooltipFill = mapStatusToTooltipFill[status] || red[3];

    return (
        <Tooltip
            className={cnTooltip}
            overlayClassName={cnTooltip}
            placement="right"
            color={tooltipFill}
            title={
                <div className={cnStatus}>
                    {status}
                    {status && loading ? ' (last known state)' : null}
                    {statusMessage ? (
                        <StatusMessage className={cnStatusMessage} statusMessage={statusMessage} />
                    ) : null}
                </div>
            }
        >
            <Icon spin={loading} className={cnIcon} style={{ color: fill }} />
        </Tooltip>
    );
}
