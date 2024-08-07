import { WifiOutlined } from '@ant-design/icons';
import { EDateTimeFormats } from '@common/types';
import dayjs from 'dayjs';
import type { ReactElement } from 'react';

import type { TDataSourceState } from '../../modules/dataSourceStatus/defs';
import type { TWithClassname } from '../../types/components';
import { Alert } from '../Alert';
import { Collapse } from '../Collapse';
import { cnLog, cnLogItem, cnLogTime, cnNetwork, cnNetworkName } from './DataSourceList.css';
import { getColorByLevel } from './utils';

export function DataSourceList(
    props: TWithClassname & { networks: TDataSourceState[] },
): ReactElement {
    return (
        <Collapse className={props.className}>
            {props.networks.map((net, i) => (
                <Collapse.Panel
                    key={i}
                    header={<NetworkTitle name={net.name} level={net.level} status={net.status} />}
                >
                    <NetworkLog log={net.log} />
                </Collapse.Panel>
            ))}
        </Collapse>
    );
}

function NetworkTitle(props: Pick<TDataSourceState, 'level' | 'status' | 'name'>) {
    return (
        <div className={cnNetwork}>
            <WifiOutlined title={props.level} style={{ color: getColorByLevel(props.level) }} />
            <div className={cnNetworkName}>{props.name}</div>
        </div>
    );
}

function NetworkLog(props: { log: TDataSourceState['log'] }) {
    return (
        <div className={cnLog}>
            {props.log.map((item, i) => (
                <Alert
                    key={i}
                    className={cnLogItem}
                    type={item.level}
                    message={
                        <>
                            <span className={cnLogTime}>
                                [{dayjs(item.timestamp).format(EDateTimeFormats.TimeMilliseconds)}]
                            </span>
                            <span>{item.message}</span>
                        </>
                    }
                />
            ))}
        </div>
    );
}
