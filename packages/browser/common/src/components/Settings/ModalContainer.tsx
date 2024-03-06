import { memo, ReactNode } from 'react';

import { createTestProps } from '../../../e2e';
import { ESettingsModalSelectors } from '../../../e2e/selectors/settings.modal.selectors';
import { Modal } from '../Modals';

export type TModalContainerProps = {
    children: ReactNode;
    closable?: boolean;
    onClose?: VoidFunction;
};

export const ModalContainer = memo(({ children, closable, onClose }: TModalContainerProps) => {
    return (
        <Modal
            title={'Settings'}
            open={true}
            closable={closable}
            maskClosable={closable}
            onCancel={onClose}
            footer={null}
            {...createTestProps(ESettingsModalSelectors.SettingsModal)}
        >
            {children}
        </Modal>
    );
});
