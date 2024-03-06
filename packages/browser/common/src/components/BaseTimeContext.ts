import { createContext } from 'react';

import type { Milliseconds } from '../types/time';

export const BaseTimeContext = createContext<Milliseconds>(0 as Milliseconds);
