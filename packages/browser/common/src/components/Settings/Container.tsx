import { ReactNode, useMemo } from 'react';

import { Divider } from '../Divider.tsx';
import { Space } from '../Space.ts';
import { Tabs } from '../Tabs.ts';
import { BFFStageName } from './components/BFFStageName.tsx';
import { cnContainer } from './view.css.ts';

export type TSettingsContainerProps = {
    children: ReactNode;
    advancedChildren?: ReactNode;
};

export const SettingsContainer = ({ children, advancedChildren }: TSettingsContainerProps) => {
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
        ],
        [advancedChildren, children],
    );

    return (
        <>
            <Tabs defaultActiveKey="general" items={items} />
            <Divider />
        </>
    );
};
