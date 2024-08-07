import { memo } from 'react';

import type { TGeneralSettingsProps } from './components/General';
import { GeneralPage } from './components/General';
import type { TModalContainerProps } from './ModalContainer';
import { ModalContainer } from './ModalContainer';

export type TSettingsModalProps = Omit<TModalContainerProps, 'children'> & TGeneralSettingsProps;

export const SettingsModal = memo(({ closable, onClose, ...restProps }: TSettingsModalProps) => (
    <ModalContainer closable={closable} onClose={onClose}>
        <GeneralPage {...restProps} />
    </ModalContainer>
));
