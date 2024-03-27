import { Divider } from '@frontend/common/src/components/Divider';
import { TimeZoneSelector } from '@frontend/common/src/components/Settings/components/TimeZoneSelector';
import { Space } from '@frontend/common/src/components/Space';
import { Tabs } from '@frontend/common/src/components/Tabs';
import { EApplicationName } from '@frontend/common/src/types/app';
import { ReactElement, useMemo } from 'react';

import { cnSpace } from './AppSettings.css';
import { CoinSelectionTabs } from './CoinSelectionTabs';
import { ShowCoinIcons } from './ShowCoinIcons';
import { ShowLocalhost } from './ShowLocalhost';

export function AppSettings(): ReactElement {
    const items = useMemo(
        () => [
            {
                label: 'General',
                key: 'general',
                children: (
                    <Space direction="vertical" size="middle" className={cnSpace}>
                        <TimeZoneSelector
                            appName={EApplicationName.BalanceMonitor}
                            extendTimeZoneList={false}
                        />
                        <ShowCoinIcons />
                        <CoinSelectionTabs />
                    </Space>
                ),
            },
            {
                label: 'Advanced',
                key: 'advanced',
                children: <ShowLocalhost />,
            },
        ],
        [],
    );

    return (
        <>
            <Tabs defaultActiveKey="general" items={items} />
            <Divider />
        </>
    );
}
