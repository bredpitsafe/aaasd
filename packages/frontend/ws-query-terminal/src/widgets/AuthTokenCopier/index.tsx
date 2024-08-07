import { LockOutlined } from '@ant-design/icons';
import { generateTraceId } from '@common/utils';
import { Button } from '@frontend/common/src/components/Button';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { ModuleSubscribeToSessionTokensRecord } from '@frontend/common/src/modules/session';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { clipboardWrite } from '@frontend/common/src/utils/clipboard';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEmpty } from 'lodash-es';
import type { ComponentProps } from 'react';
import { memo } from 'react';

type TProps = TWithClassname & {
    size: ComponentProps<typeof Button>['size'];
    type: 'icon-label' | 'icon';
};

export const AuthTokenCopier = memo(({ className, type, size }: TProps) => {
    const { error } = useModule(ModuleNotifications);
    const { success } = useModule(ModuleMessages);
    const tokens = useNotifiedValueDescriptorObservable(
        useModule(ModuleSubscribeToSessionTokensRecord)(undefined, { traceId: generateTraceId() }),
    );

    const hasTokens = isSyncedValueDescriptor(tokens) && !isEmpty(tokens.value);

    async function copyToClipboard() {
        if (!hasTokens) {
            error({ message: 'Error copying authentication token' });
            return;
        }

        await clipboardWrite(JSON.stringify(tokens.value, null, 4));
        success('Authentication token copied to clipboard');
    }

    return (
        <Button
            className={className}
            size={size}
            icon={<LockOutlined />}
            disabled={!hasTokens}
            title="Copy authentication token to clipboard"
            onClick={copyToClipboard}
        >
            {type === 'icon' ? null : 'Copy Auth Token'}
        </Button>
    );
});
