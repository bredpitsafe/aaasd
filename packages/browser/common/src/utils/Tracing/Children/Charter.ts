import { logger } from '../index';
import { Binding } from './Binding';

export const loggerCharter = logger.child(new Binding('Charter'));
