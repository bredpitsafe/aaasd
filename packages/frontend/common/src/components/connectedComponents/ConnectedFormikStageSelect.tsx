import { useField } from 'formik';

import { TSettingsStoreName } from '../../actors/Settings/db';
import { TSocketName } from '../../types/domain/sockets';
import { ConnectedStageSelect } from './ConnectedStageSelect';

type TProps = {
    name: string;
    settingsStoreName: TSettingsStoreName;
};

export function ConnectedFormikStageSelect({ name, settingsStoreName }: TProps) {
    const [{ value }, , { setValue }] = useField<TSocketName>(name);
    return (
        <ConnectedStageSelect
            size="middle"
            settingsStoreName={settingsStoreName}
            type="icon-label"
            current={value}
            onChangeSocket={setValue}
        />
    );
}
