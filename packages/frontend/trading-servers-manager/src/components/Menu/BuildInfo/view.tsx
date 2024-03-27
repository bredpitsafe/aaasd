import { InfoCircleOutlined } from '@ant-design/icons';
import { Age } from '@frontend/common/src/components/Age';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import { TWithChildren } from '@frontend/common/src/types/components';
import { TWithBuildInfo } from '@frontend/common/src/types/domain/buildInfo';
import { EDateTimeFormats, ISO, TimeZone } from '@frontend/common/src/types/time';
import { toDayjsWithTimezone } from '@frontend/common/src/utils/time';
import { isNil } from 'lodash-es';
import { ReactElement } from 'react';

import { cnIcon, cnNoWrap } from './view.css';

const styleAutoWidth = {
    maxWidth: 'unset',
};

export function BuildInfo(
    props: TWithBuildInfo &
        TWithChildren & {
            startTime?: ISO;
            timeZone: TimeZone;
        },
): null | ReactElement {
    const { buildInfo, startTime, timeZone } = props;

    if (isNil(buildInfo)) {
        return null;
    }

    return (
        <Tooltip
            overlayStyle={styleAutoWidth}
            title={
                <div>
                    <div className={cnNoWrap}>Version: {buildInfo.version}</div>
                    {buildInfo.commit === undefined ? null : (
                        <div className={cnNoWrap}>Commit: {buildInfo.commit}</div>
                    )}
                    {buildInfo.buildId === undefined ? null : (
                        <div className={cnNoWrap}>Build ID: {buildInfo.buildId}</div>
                    )}
                    {startTime === undefined ? null : (
                        <>
                            <div className={cnNoWrap}>
                                Start Time:{' '}
                                {toDayjsWithTimezone(startTime, timeZone).format(
                                    EDateTimeFormats.DateTime,
                                )}
                            </div>
                            <div className={cnNoWrap}>
                                Uptime: <Age timestamp={startTime} />
                            </div>
                        </>
                    )}
                </div>
            }
            placement="right"
        >
            {props.children ?? <InfoCircleOutlined className={cnIcon} />}
        </Tooltip>
    );
}
