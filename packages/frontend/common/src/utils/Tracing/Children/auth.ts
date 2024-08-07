import { logger } from '../index';
import { Binding } from './Binding';

export const loggerAuth = logger.child(new Binding('Auth'));
