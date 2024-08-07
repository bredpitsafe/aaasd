import { MenuUnfoldOutlined } from '@ant-design/icons';
import { Button } from '@frontend/common/src/components/Button';
import { Drawer } from '@frontend/common/src/components/Drawer';
import { FloatButton } from '@frontend/common/src/components/FloatButton';
import { Suspense } from '@frontend/common/src/components/Suspense';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useEffect, useMemo, useState } from 'react';
import { lazily } from 'react-lazily';

import { useCompactComponentsMenu } from '../../components/Settings/hooks/useCompactComponentsMenu';
import { EGlobalLayoutComponents } from '../../layouts/global';

type TWidgetCompactMenuButtonProps = {
    type: 'icon-label' | 'icon' | 'float';
};

const { WidgetMenu } = lazily(() => import('../WidgetMenu/WidgetMenu'));

const bodyStyle = { padding: 0 };
const headerStyle = { display: 'none' };

export const WidgetCompactMenuButton = ({ type }: TWidgetCompactMenuButtonProps) => {
    const [compact] = useCompactComponentsMenu();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!compact) {
            setOpen(false);
        }
    }, [compact]);

    const cbOpenDrawer = useFunction(() => setOpen(true));
    const cbCloseDrawer = useFunction(() => setOpen(false));

    const button = useMemo(() => {
        const icon = <MenuUnfoldOutlined />;
        return type === 'float' ? (
            <FloatButton icon={icon} tooltip="Components list drawer" onClick={cbOpenDrawer} />
        ) : (
            <Button
                icon={<MenuUnfoldOutlined />}
                title="Components list drawer"
                onMouseEnter={cbOpenDrawer}
            >
                {type === 'icon' ? null : 'Components list drawer'}
            </Button>
        );
    }, [cbOpenDrawer, type]);

    const drawer = useMemo(
        () =>
            compact && (
                <Drawer
                    open={open}
                    onClose={cbCloseDrawer}
                    placement="left"
                    bodyStyle={bodyStyle}
                    headerStyle={headerStyle}
                >
                    <Suspense component={EGlobalLayoutComponents.Menu}>
                        <WidgetMenu />
                    </Suspense>
                </Drawer>
            ),
        [cbCloseDrawer, compact, open],
    );

    if (!compact) {
        return null;
    }

    return (
        <>
            {button}
            {drawer}
        </>
    );
};
