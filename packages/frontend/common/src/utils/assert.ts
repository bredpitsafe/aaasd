import { logger } from './Tracing';

export function assertType(value?: never, message?: string): void {
    logger.error(message ?? `Unexpected value - "${value}"`);
}
