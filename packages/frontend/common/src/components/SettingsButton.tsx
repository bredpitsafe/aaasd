import { SettingOutlined } from '@ant-design/icons';
import { ReactElement } from 'react';

import {
    EMainMenuModalSelectors,
    EMainMenuProps,
} from '../../e2e/selectors/main-menu.modal.selectors';
import { Button } from './Button';

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
