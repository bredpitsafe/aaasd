import type { Milliseconds } from '@common/types';
import { createContext } from 'react';

export const BaseTimeContext = createContext<Milliseconds>(0 as Milliseconds);
