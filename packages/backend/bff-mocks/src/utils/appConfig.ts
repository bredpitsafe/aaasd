import configPackage from 'config';

import type { TAppConfig } from '../def/appConfig';

export const appConfig = configPackage.util.toObject() as unknown as TAppConfig;
