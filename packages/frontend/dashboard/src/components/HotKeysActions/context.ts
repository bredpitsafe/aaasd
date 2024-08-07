import { createContext } from 'react';

import type { THotKeyActionContext } from './defs';

export const HotKeyActionContext = createContext<THotKeyActionContext | undefined>(undefined);
