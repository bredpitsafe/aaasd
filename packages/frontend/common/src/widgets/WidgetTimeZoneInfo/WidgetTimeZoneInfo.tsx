import { ClockCircleOutlined } from '@ant-design/icons';
import { getTimeZoneFullName } from '@common/utils';

import {
    EMainMenuModalSelectors,
    EMainMenuProps,
} from '../../../e2e/selectors/main-menu.modal.selectors.ts';
import { useTimeZoneInfoSettings } from '../../components/Settings/hooks/useTimeZoneSettings';
import { Tooltip } from '../../components/Tooltip';
import { cnTimeZone, cnTimeZoneIcon } from './WidgetTimeZoneInfo.css';

interface TWidgetTimeZoneInfo {
    collapsed: boolean;
}

export function WidgetTimeZoneInfo(props: TWidgetTimeZoneInfo) {
    const [timeZoneInfo] = useTimeZoneInfoSettings();
    const timeZoneName = getTimeZoneFullName(timeZoneInfo);

    return (
        <>
            {props.collapsed ? (
                <Tooltip title={timeZoneName} showArrow={false}>
                    <div className={cnTimeZoneIcon}>
                        <ClockCircleOutlined />
                    </div>
                </Tooltip>
            ) : (
                <div className={cnTimeZone} {...EMainMenuProps[EMainMenuModalSelectors.TimeZone]}>
                    {timeZoneName}
                </div>
            )}
        </>
    );
}
