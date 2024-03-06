import { SettingOutlined } from '@ant-design/icons';
import { ReactElement } from 'react';

import { Button } from './Button';

export function SettingsButton(props: { onClick: () => void }): ReactElement {
    return (
        <Button
            type="text"
            onClick={props.onClick}
            icon={<SettingOutlined />}
            title="Open settings"
        />
    );
}
