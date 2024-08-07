import type { ComponentProps } from 'react';

import { logger } from '../utils/Tracing';
import { Alert } from './Alert';

export type ErrorBoundaryProps = ComponentProps<typeof ErrorBoundary>;

export class ErrorBoundary extends Alert.ErrorBoundary {
    componentDidCatch(error: Error | null, info: object) {
        super.componentDidCatch(error, info);
        logger.error(error?.message ?? 'React Error Boundary', info);
    }
}
