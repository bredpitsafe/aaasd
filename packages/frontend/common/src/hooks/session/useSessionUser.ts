import type { Nil } from '@common/types';
import { generateTraceId } from '@common/utils';
import { useMemo } from 'react';

import { useModule } from '../../di/react.tsx';
import { ModuleSubscribeToSessionUsersRecord } from '../../modules/session';
import type { TUser } from '../../modules/user';
import { EDomainName } from '../../types/domain/evironment.ts';
import { useNotifiedValueDescriptorObservable } from '../../utils/React/useValueDescriptorObservable.ts';

export function useSessionUser(): Nil | TUser {
    const users = useNotifiedValueDescriptorObservable(
        useModule(ModuleSubscribeToSessionUsersRecord)(undefined, { traceId: generateTraceId() }),
    );
    return useMemo(() => users.value?.[EDomainName.Prod] ?? users.value?.[EDomainName.Ms], [users]);
}
