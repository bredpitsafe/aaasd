import type { BadgeProps } from '@frontend/common/src/components/Badge';
import { Badge } from '@frontend/common/src/components/Badge';
import { grey } from '@frontend/common/src/utils/colors';

import { badgeRoot } from './view.css';

type TPermissionsCountBadgeProps = BadgeProps & {
    permissionsCount: number;
};

export const PermissionsCountBadge = (props: TPermissionsCountBadgeProps) => {
    const { permissionsCount, ...badgeProps } = props;

    return (
        <Badge
            title={`${permissionsCount} active permission${permissionsCount > 1 ? 's' : ''}`}
            count={permissionsCount}
            color={grey.primary}
            size="small"
            className={badgeRoot}
            {...badgeProps}
        />
    );
};
