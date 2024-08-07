import type { Nil } from '@common/types';
import { generateTraceId } from '@common/utils';
import { useMemo } from 'react';

import type { TSession } from '../../actors/Session/domain.ts';
import { useModule } from '../../di/react.tsx';
import { ModuleSubscribeToSessionsRecord } from '../../modules/session';
import { EDomainName } from '../../types/domain/evironment.ts';
import { useNotifiedValueDescriptorObservable } from '../../utils/React/useValueDescriptorObservable.ts';

export function useSession(): Nil | TSession {
    const sessions = useNotifiedValueDescriptorObservable(
        useModule(ModuleSubscribeToSessionsRecord)(undefined, { traceId: generateTraceId() }),
    );
    return useMemo(
        () => sessions.value?.[EDomainName.Prod] ?? sessions.value?.[EDomainName.Ms],
        [sessions],
    );
}
