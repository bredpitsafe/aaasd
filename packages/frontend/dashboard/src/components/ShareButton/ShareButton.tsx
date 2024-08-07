import { CopyOutlined, ExportOutlined, ShareAltOutlined } from '@ant-design/icons';
import type { ButtonProps } from '@frontend/common/src/components/Button';
import { Button } from '@frontend/common/src/components/Button';
import { Dropdown } from '@frontend/common/src/components/Dropdown';
import { Menu } from '@frontend/common/src/components/Menu';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { ForwardedRef, ReactElement } from 'react';
import type React from 'react';
import { forwardRef, useMemo } from 'react';

enum EShareButtonCallbacks {
    onCloneDashboard = 'onCloneDashboard',
    onShareDashboardXmlFile = 'onShareDashboardXmlFile',
    onClonePanel = 'onClonePanel',
}

export type TShareButtonProps = ButtonProps & {
    onCloneDashboard?: () => void;
    onExportDashboardFile?: () => void;
    onClonePanel?: () => void;
};

export const ShareButton = forwardRef(
    (props: TShareButtonProps, ref: ForwardedRef<HTMLElement>): ReactElement => {
        const { onCloneDashboard, onExportDashboardFile, onClonePanel, ...buttonProps } = props;

        const cbShare = useFunction((e: { key: React.Key }) => {
            switch (e.key) {
                case EShareButtonCallbacks.onCloneDashboard: {
                    return onCloneDashboard?.();
                }
                case EShareButtonCallbacks.onShareDashboardXmlFile: {
                    return onExportDashboardFile?.();
                }

                case EShareButtonCallbacks.onClonePanel: {
                    return onClonePanel?.();
                }
            }
        });

        const menu = useMemo(
            () => (
                <Menu onClick={cbShare}>
                    {onCloneDashboard && (
                        <Menu.Item
                            key={EShareButtonCallbacks.onCloneDashboard}
                            icon={<CopyOutlined />}
                        >
                            Clone dashboard
                        </Menu.Item>
                    )}
                    {onExportDashboardFile && (
                        <Menu.Item
                            key={EShareButtonCallbacks.onShareDashboardXmlFile}
                            icon={<ExportOutlined />}
                        >
                            Export dashboard
                        </Menu.Item>
                    )}
                    {onClonePanel && (
                        <Menu.Item key={EShareButtonCallbacks.onClonePanel} icon={<CopyOutlined />}>
                            Clone panel
                        </Menu.Item>
                    )}
                </Menu>
            ),
            [cbShare, onCloneDashboard, onExportDashboardFile, onClonePanel],
        );

        return (
            <>
                <Dropdown overlay={menu} trigger={['click']} disabled={buttonProps.disabled}>
                    <Button
                        ref={ref}
                        title={'Share options'}
                        icon={<ShareAltOutlined />}
                        {...buttonProps}
                    />
                </Dropdown>
            </>
        );
    },
);
