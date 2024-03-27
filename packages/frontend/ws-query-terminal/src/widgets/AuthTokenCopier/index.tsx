import { LockOutlined } from '@ant-design/icons';
import { Button } from '@frontend/common/src/components/Button';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { getSessionToken$ } from '@frontend/common/src/modules/session';
import { TWithClassname } from '@frontend/common/src/types/components';
import { clipboardWrite } from '@frontend/common/src/utils/clipboard';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isString } from 'lodash-es';
import { ComponentProps, memo } from 'react';

type TProps = TWithClassname & {
    size: ComponentProps<typeof Button>['size'];
    type: 'icon-label' | 'icon';
};

export const AuthTokenCopier = memo(({ className, type, size }: TProps) => {
    const { error } = useModule(ModuleNotifications);
    const { success } = useModule(ModuleMessages);
    const token = useSyncObservable(getSessionToken$());
    async function copyToClipboard() {
        if (!isString(token)) {
            error({ message: 'Error copying authentication token' });
            return;
        }

        await clipboardWrite(token);
        success('Authentication token copied to clipboard');
    }

    return (
        <Button
            className={className}
            size={size}
            icon={<LockOutlined />}
            disabled={!isString(token)}
            title="Copy authentication token to clipboard"
            onClick={copyToClipboard}
        >
            {type === 'icon' ? null : 'Copy Auth Token'}
        </Button>
    );
});
