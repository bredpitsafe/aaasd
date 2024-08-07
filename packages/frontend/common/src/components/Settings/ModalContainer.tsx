import type { ReactNode } from 'react';
import { memo } from 'react';

import { createTestProps } from '../../../e2e';
import { ESettingsModalSelectors } from '../../../e2e/selectors/settings.modal.selectors';
import { useModule } from '../../di/react.tsx';
import { ModuleApplicationName } from '../../modules/applicationName';
import { AppLogo } from '../AppLogo/AppLogo.tsx';
import { cnModalTitle } from '../DefaultSettingsRoute.css.ts';
import { Modal } from '../Modals';

export type TModalContainerProps = {
    children: ReactNode;
    closable?: boolean;
    onClose?: VoidFunction;
};

export const ModalContainer = memo(({ children, closable, onClose }: TModalContainerProps) => {
    const { appName, appTitle } = useModule(ModuleApplicationName);

    const title = (
        <div className={cnModalTitle}>
            <AppLogo appName={appName} />
            {appTitle} Settings
        </div>
    );
    return (
        <Modal
            title={title}
            open
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
