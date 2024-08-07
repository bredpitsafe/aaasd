import { green, grey, orange, red } from '@ant-design/colors';
import { assertNever } from '@common/utils/src/assert.ts';
import { Badge } from '@frontend/common/src/components/Badge';
import { Card } from '@frontend/common/src/components/Card';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import type { TComponentStatusInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { EComponentStatus } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import {
    cnComponentBadgeDescription,
    cnComponentBadgeHeader,
    cnComponentStatusCard,
    cnComponentStatusCardOverlay,
    cnStatusBadge,
} from './view.css';

export const ComponentStatusBadge = memo(
    ({
        collapsed,
        groups,
        status,
    }: {
        collapsed: boolean;
        groups: Partial<Record<EComponentStatus, TComponentStatusInfo[]>>;
        status: EComponentStatus;
    }) => {
        const color = useMemo(() => {
            switch (status) {
                case EComponentStatus.Starting:
                    return green[5];

                case EComponentStatus.Started:
                    return green[6];

                case EComponentStatus.Failed:
                    return red[4];

                case EComponentStatus.Alarm:
                    return orange[5];

                case EComponentStatus.Stopped:
                    return grey[5];

                default:
                    assertNever(status);
            }
        }, [status]);

        const componentStatuses = groups[status];

        if (isNil(componentStatuses)) {
            return null;
        }

        return (
            <Tooltip
                title={
                    <Card size="small" className={cnComponentStatusCard} title={status}>
                        {componentStatuses?.map(({ componentId, description }) => (
                            <span key={componentId}>
                                <h4 className={cnComponentBadgeHeader}>{componentId}</h4>
                                <p className={cnComponentBadgeDescription}>{description}</p>
                            </span>
                        ))}
                    </Card>
                }
                placement="right"
                color={color}
                overlayClassName={cnComponentStatusCardOverlay}
            >
                <Badge
                    className={cnStatusBadge}
                    size="default"
                    color={color}
                    count={componentStatuses.length}
                    title=""
                    text={collapsed ? undefined : status}
                />
            </Tooltip>
        );
    },
);
