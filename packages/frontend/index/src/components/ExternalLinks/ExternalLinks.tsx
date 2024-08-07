import { AntDesignOutlined, BugOutlined, SlackSquareOutlined } from '@ant-design/icons';
import { cnLink } from '@frontend/common/src/components/Link/index.css.ts';
import type { TWithClassname } from '@frontend/common/src/types/components.ts';
import { Tooltip } from 'antd';
import cn from 'classnames';
import type { ReactNode } from 'react';

import { cnLinkInner, cnLinks } from '../AppLinks/AppLinks.css.ts';

type TExternalLinksProps = TWithClassname;

type TExternalLink = {
    title: string;
    description?: string;
    url: string;
    icon?: ReactNode;
};

const EXTERNAL_LINKS: TExternalLink[] = [
    {
        title: '#helpdesk-front',
        url: 'https://bhftteam.slack.com/archives/C05DMFA8EJ0',
        icon: <SlackSquareOutlined />,
        description: 'Platform UI Helpdesk. Report UI-related issues here.',
    },
    {
        title: 'Confluence',
        url: 'https://bhft-company.atlassian.net/wiki/spaces/PLATUSER/overview',
        icon: <AntDesignOutlined />,
        description: 'Platform Documentation',
    },
    {
        title: 'UI Troubleshooting',
        url: 'https://bhft-company.atlassian.net/wiki/spaces/PLATUSER/pages/289800450/UI+Troubleshooting',
        icon: <BugOutlined />,
        description: 'How to collect debug information when UI misbehaves.',
    },
];

export const ExternalLinks = (props: TExternalLinksProps) => {
    const { className } = props;
    return (
        <div className={cn(className, cnLinks)}>
            {EXTERNAL_LINKS.map(({ title, url, icon, description }) => {
                return (
                    <Tooltip key={title} title={description} trigger="hover" mouseEnterDelay={0}>
                        <a
                            className={cn(cnLink, cnLinkInner)}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {icon}
                            {title}
                        </a>
                    </Tooltip>
                );
            })}
        </div>
    );
};
