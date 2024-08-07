import type { EApplicationName, EApplicationTitle, EApplicationURL } from '@common/types';
import { assert } from '@common/utils/src/assert.ts';
import { isNil } from 'lodash-es';

import { ModuleFactory } from '../../di';
import { appNameToAppTitle, appNameToAppURL } from '../../utils/getPathToRoot.ts';

const createModule = () => {
    let appName: EApplicationName | undefined;
    return {
        setAppName(v: EApplicationName) {
            appName = v;
        },
        get appName() {
            assert(!isNil(appName), 'appName is not defined');
            return appName;
        },
        get appTitle(): EApplicationTitle {
            assert(!isNil(appName), 'appName is not defined');
            return appNameToAppTitle(appName);
        },
        get appUrl(): EApplicationURL {
            assert(!isNil(appName), 'appName is not defined');
            return appNameToAppURL(appName);
        },
    };
};

export const ModuleApplicationName = ModuleFactory(createModule);
