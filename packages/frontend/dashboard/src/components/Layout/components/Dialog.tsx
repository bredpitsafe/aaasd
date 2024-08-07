import { CloseOutlined } from '@ant-design/icons';
import { Button } from '@frontend/common/src/components/Button';
import { Card } from '@frontend/common/src/components/Card';
import type { TWithClassname } from '@frontend/common/src/types/components';
import cn from 'classnames';
import type { ReactElement, ReactNode, Ref } from 'react';
import { useCallback } from 'react';

import { cnCard, cnClose, cnDialog } from './Dialog.css';

type TDialogProps = TWithClassname & {
    rootRef?: Ref<HTMLDivElement>;

    onClose?: VoidFunction;
    visible: boolean;
    title: ReactNode;
    children: ReactNode;
};

export function Dialog({
    className,
    rootRef,
    visible,
    onClose,
    children,
    title,
}: TDialogProps): ReactElement | null {
    const closeCb = useCallback(() => onClose!(), [onClose]);

    return !visible ? null : (
        <div className={cn(cnDialog, className)} ref={rootRef}>
            <Card bodyStyle={{ padding: '10px', flexGrow: 1 }} title={title} className={cnCard}>
                {children}
            </Card>
            {onClose && (
                <Button
                    className={cnClose}
                    shape="circle"
                    icon={<CloseOutlined />}
                    onClick={closeCb}
                />
            )}
        </div>
    );
}
