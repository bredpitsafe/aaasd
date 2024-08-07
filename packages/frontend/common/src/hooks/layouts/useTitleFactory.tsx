import { CloseCircleOutlined, CloseSquareOutlined, FullscreenOutlined } from '@ant-design/icons';
import type { TabNode } from 'flexlayout-react';
import type { ITitleObject } from 'flexlayout-react/src/view/Layout.tsx';
import { isNil } from 'lodash-es';
import type { ReactNode } from 'react';

import { Dropdown } from '../../components/Dropdown.tsx';
import type { MenuProps } from '../../components/Menu.tsx';
import { useModule } from '../../di/react.tsx';
import { ModuleLayouts } from '../../modules/layouts';
import { EMaximizeState } from '../../modules/layouts/data.ts';
import { ModuleLayoutRouter } from '../../modules/router';
import { useFunction } from '../../utils/React/useFunction.ts';
import type { TUseLayoutProps } from './useLayout.tsx';

enum EContextMenuKeys {
    SingleTabMode = 'SingleTabMode',
    Close = 'Close',
    CloseOtherTabs = 'CloseOtherTabs',
    CloseOtherTabsInTabSet = 'CloseOtherTabsInTabSet',
    MaximizeTabset = 'MaximizeTabset',
}

const getContextMenuItems = (node: TabNode): MenuProps['items'] => {
    return [
        {
            label: 'Close Tab',
            key: EContextMenuKeys.Close,
            icon: <CloseCircleOutlined />,
            disabled: !node.isEnableClose(),
            title: 'Middle Mouse Button on Tab Header',
        },
        {
            label: 'Close Other Tabs in Tabset',
            key: EContextMenuKeys.CloseOtherTabsInTabSet,
            icon: <CloseSquareOutlined />,
            title: 'Ctrl+MMB on Tab Header',
        },
        {
            label: 'Close All Other Tabs',
            key: EContextMenuKeys.CloseOtherTabs,
            icon: <CloseSquareOutlined />,
            title: 'Ctrl+Shift+MMB on Tab Header',
        },
        { type: 'divider' },
        {
            label: 'Maximize Tab',
            key: EContextMenuKeys.SingleTabMode,
            icon: <FullscreenOutlined />,
        },
        {
            label: 'Maximize Tabset',
            key: EContextMenuKeys.MaximizeTabset,
            icon: <FullscreenOutlined />,
        },
    ];
};

export function useTitleFactory(
    factory: TUseLayoutProps['titleFactory'],
): Exclude<TUseLayoutProps['titleFactory'], undefined> {
    const { setParams } = useModule(ModuleLayoutRouter);
    const { deleteTab, deleteOtherTabs, upsertTab } = useModule(ModuleLayouts);

    const onClick = useFunction((tab: string, event: { key: string }) => {
        switch (event.key) {
            case EContextMenuKeys.SingleTabMode: {
                void setParams({ tab, singleTab: true });
                break;
            }
            case EContextMenuKeys.Close: {
                deleteTab(tab);
                break;
            }
            case EContextMenuKeys.CloseOtherTabs: {
                deleteOtherTabs(tab);
                break;
            }
            case EContextMenuKeys.CloseOtherTabsInTabSet: {
                deleteOtherTabs(tab, true);
                break;
            }
            case EContextMenuKeys.MaximizeTabset: {
                upsertTab(tab, { tabsetOptions: { maximize: EMaximizeState.Maximized } });
                break;
            }
        }
    });

    return useFunction((node: TabNode) => {
        const factoryTitle = factory?.(node);
        const title = isNil(factoryTitle)
            ? node.getName()
            : isTitleObject(factoryTitle)
              ? factoryTitle.titleContent
              : factoryTitle;

        const handleClick: MenuProps['onClick'] = onClick.bind(null, node.getId());

        return (
            <Dropdown
                menu={{ items: getContextMenuItems(node), onClick: handleClick }}
                trigger={['contextMenu']}
                destroyPopupOnHide
                transitionName=""
            >
                <div>{title}</div>
            </Dropdown>
        );
    });
}

function isTitleObject(title: ITitleObject | ReactNode): title is ITitleObject {
    return !isNil(title) && typeof title === 'object' && 'titleContent' in title;
}
