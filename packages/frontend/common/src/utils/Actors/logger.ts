import { logger } from '../Tracing';
import { Binding } from '../Tracing/Children/Binding.ts';

export const loggerWebactor = logger.child(new Binding('Actor'));
