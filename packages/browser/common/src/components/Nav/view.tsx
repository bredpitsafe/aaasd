import {
    DoubleLeftOutlined,
    DoubleRightOutlined,
    FullscreenExitOutlined,
    FullscreenOutlined,
    MenuOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import cn from 'classnames';
import { ReactElement, useMemo, useRef } from 'react';
import { useFullscreen, useToggle } from 'react-use';

import { ENavType } from '../../actors/Settings/types';
import { TWithChildren, TWithClassname } from '../../types/components';
import { useFunction } from '../../utils/React/useFunction';
import { Button } from '../Button';
import { ConnectedAuthenticationButton } from '../connectedComponents/ConnectedAuthenticationButton';
import { ConnectedNetworkStatus } from '../connectedComponents/ConnectedNetworkStatus';
import { ConnectedNotificationsList } from '../connectedComponents/ConnectedNotificationsList';
import { FloatButton } from '../FloatButton';
import { SettingsButton } from '../SettingsButton';
import { cnRoot, cnSection, cnSectionRow, cnShowNavButton } from './view.css';

export type TNavChildrenProps = {
    collapsed: boolean;
    type: ENavType;
};

export type TNavChildRenderFunction = (
    params: TNavChildrenProps,
) => TWithChildren['children'] | undefined;

export type TNavProps = TWithClassname &
    TWithChildren<TNavChildRenderFunction> & {
        type: ENavType | undefined;
        onTypeChange: (type: ENavType) => void;
        onOpenModalSettings: VoidFunction;
    };

export function Nav(props: TNavProps): ReactElement {
    const { className, type = ENavType.Small, onTypeChange, onOpenModalSettings, children } = props;
    const makeBigger = useFunction(() => {
        if (type === ENavType.Hidden) onTypeChange(ENavType.Small);
        if (type === ENavType.Small) onTypeChange(ENavType.Full);
    });
    const makeSmaller = useFunction(() => {
        if (type === ENavType.Full) onTypeChange(ENavType.Small);
        if (type === ENavType.Small) onTypeChange(ENavType.Hidden);
    });

    const ref = useRef(document.body);
    const [fullscreen, toggleFullscreen] = useToggle(false);
    const cbCloseFullscreen = useFunction(() => toggleFullscreen(false));
    const isFullscreen = useFullscreen(ref, fullscreen, { onClose: cbCloseFullscreen });

    const childrenElement = useMemo(
        () => children?.({ type, collapsed: type !== ENavType.Full }),
        [children, type],
    );

    if (type === ENavType.Hidden) {
        return (
            <FloatButton.Group className={cnShowNavButton} trigger="hover" icon={<MenuOutlined />}>
                <FloatButton
                    icon={<DoubleRightOutlined />}
                    tooltip="Open menu"
                    onClick={type === ENavType.Hidden ? makeBigger : makeSmaller}
                />
                <FloatButton
                    onClick={onOpenModalSettings}
                    icon={<SettingOutlined />}
                    tooltip="Open settings"
                />
                {childrenElement}
            </FloatButton.Group>
        );
    }

    return (
        <div className={cn(className, cnRoot[type])}>
            {childrenElement}
            <div
                className={cn(cnSection, {
                    [cnSectionRow]: type === ENavType.Full,
                })}
            >
                <ConnectedAuthenticationButton />

                <Button
                    type="text"
                    icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                    title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                    onClick={toggleFullscreen}
                />
                <ConnectedNotificationsList />
                <ConnectedNetworkStatus />
                <SettingsButton onClick={onOpenModalSettings} />
                <Button
                    type="text"
                    icon={type === ENavType.Full ? <DoubleLeftOutlined /> : <DoubleRightOutlined />}
                    title={type === ENavType.Full ? 'Compact menu' : 'Full menu'}
                    onClick={type === ENavType.Full ? makeSmaller : makeBigger}
                />
                {type === ENavType.Small ? (
                    <Button
                        type="text"
                        icon={<DoubleLeftOutlined />}
                        title="Hide menu"
                        onClick={makeSmaller}
                    />
                ) : null}
            </div>
        </div>
    );
}
