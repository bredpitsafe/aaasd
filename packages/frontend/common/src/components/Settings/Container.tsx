import type { ReactNode } from 'react';
import { useMemo } from 'react';

import { Space } from '../Space.ts';
import { Tabs } from '../Tabs.ts';
import { BFFStageName } from './components/BFFStageName.tsx';
import { cnContainer } from './view.css.ts';

export type TSettingsContainerProps = {
    children: ReactNode;
    advancedChildren?: ReactNode;
    infoChildren?: ReactNode;
};

export const SettingsContainer = ({
    children,
    advancedChildren,
    infoChildren,
}: TSettingsContainerProps) => {
    const items = useMemo(
        () => [
            {
                label: 'General',
                key: 'general',
                children: (
                    <Space direction="vertical" className={cnContainer}>
                        {children}
                    </Space>
                ),
            },
            {
                label: 'Advanced',
                key: 'advanced',
                children: (
                    <Space direction="vertical" className={cnContainer}>
                        <BFFStageName />
                        {advancedChildren}
                    </Space>
                ),
            },
            {
                label: 'Info',
                key: 'info',
                children: (
                    <Space direction="vertical" className={cnContainer}>
                        {infoChildren}
                    </Space>
                ),
            },
        ],
        [advancedChildren, children, infoChildren],
    );

    return <Tabs defaultActiveKey="general" items={items} />;
};
