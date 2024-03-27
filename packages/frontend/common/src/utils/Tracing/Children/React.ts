import { logger } from '../index';
import { Binding } from './Binding';

export const loggerReact = logger.child(new Binding('React'));
