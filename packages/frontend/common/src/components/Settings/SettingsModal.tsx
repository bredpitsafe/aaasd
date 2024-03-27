import { memo } from 'react';

import { TSettingsStoreName } from '../../actors/Settings/db';
import { GeneralPage, TGeneralSettingsProps } from './components/General';
import { ModalContainer, TModalContainerProps } from './ModalContainer';

export type TSettingsModalProps = Omit<TModalContainerProps, 'children'> &
    TGeneralSettingsProps & {
        settingsStoreName: TSettingsStoreName;
    };

export const SettingsModal = memo(({ closable, onClose, ...restProps }: TSettingsModalProps) => (
    <ModalContainer closable={closable} onClose={onClose}>
        <GeneralPage {...restProps} />
    </ModalContainer>
));
