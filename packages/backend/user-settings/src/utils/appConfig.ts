import configPackage from 'config';

import type { TAppConfig } from '../defs/appConfig.ts';

export const appConfig = configPackage.util.toObject() as unknown as TAppConfig;
