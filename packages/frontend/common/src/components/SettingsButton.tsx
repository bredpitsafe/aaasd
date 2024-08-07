import { SettingOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { ReactElement } from 'react';

import {
    EMainMenuModalSelectors,
    EMainMenuProps,
} from '../../e2e/selectors/main-menu.modal.selectors';

export function SettingsButton(props: { onClick: () => void }): ReactElement {
    return (
        <Button
            {...EMainMenuProps[EMainMenuModalSelectors.OpenSettingsButton]}
            type="text"
            onClick={props.onClick}
            icon={<SettingOutlined />}
            title="Open settings"
        />
    );
}
