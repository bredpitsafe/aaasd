import { logger } from '../../utils/Tracing';
import { Binding } from '../../utils/Tracing/Children/Binding.ts';

export const agTableLogger = logger.child(new Binding('AgTable'));
