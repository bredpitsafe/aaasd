import { ModuleRemoveComponent } from '../../handlers/moduleRemoveComponent';
import type { SocketStreamError } from '../../lib/SocketStream/SocketStreamError';
import { ServerActionModuleFactory } from '../../utils/ModuleFactories/ServerModuleFactory';

export const ModuleRemoveComponentAction = ServerActionModuleFactory(ModuleRemoveComponent)(() => ({
    loading: () => `Removing component...`,
    success: () => `Component removed successfully`,
    error: (err: Error | SocketStreamError) => ({
        message: 'Error removing component',
        description: err.message,
    }),
}));
