import { logger } from '../index';
import { Binding } from './Binding';

export const loggerInfinitySnapshot = logger.child(new Binding('InfinitySnapshot'));
