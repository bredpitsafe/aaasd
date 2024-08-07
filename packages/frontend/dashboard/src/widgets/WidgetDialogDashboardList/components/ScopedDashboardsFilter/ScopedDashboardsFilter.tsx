import { Tooltip } from '@frontend/common/src/components/Tooltip';
import { Switch } from 'antd';

import { cnScopeFilter } from './styles.css';

export function ScopedDashboardsFilter(props: {
    showBoundDashboardsOnly: boolean;
    onScopeFilterChanged: (showBoundDashboardsOnly: boolean) => void;
}) {
    return (
        <div className={cnScopeFilter}>
            <Tooltip title={<span>Show bound dashboards only</span>}>
                <Switch
                    checked={props.showBoundDashboardsOnly}
                    onChange={props.onScopeFilterChanged}
                />
            </Tooltip>
        </div>
    );
}
