import { map } from 'rxjs/operators';

import domains from '../../../../../../configs/domains.json';
import { toContextRef } from '../../di';
import type { EDomainName } from '../../types/domain/evironment.ts';
import { createActor } from '../../utils/Actors';
import { isWindow } from '../../utils/detect.ts';
import { isDevelopment } from '../../utils/environment.ts';
import { getLocation } from '../../utils/location.ts';
import { ModuleRegisterActorRemoteProcedure } from '../../utils/RPC/registerRemoteProcedure.ts';
import { createSyncedValueDescriptor } from '../../utils/ValueDescriptor/utils.ts';
import { EActorName } from '../Root/defs.ts';
import type { TKeycloakInstance } from './createKeycloakInstance.ts';
import { createKeycloakInstance } from './createKeycloakInstance.ts';
import {
    keycloakLoginDescriptor,
    keycloakLogoutDescriptor,
    keycloakReloginDescriptor,
} from './descriptors.ts';
import { initKeycloakInstanceEffects } from './effects.ts';
import { execFunctionWithLock } from './util.ts';

export function createActorKeycloak() {
    if (!isWindow) {
        throw new Error('Keycloak can be created only in browser context');
    }

    return createActor(EActorName.Keycloak, (context) => {
        const ctx = toContextRef(context);
        const register = ModuleRegisterActorRemoteProcedure(ctx);

        const mapUrlToInstance = new Map<string, TKeycloakInstance>();

        function getInstance(name: EDomainName): TKeycloakInstance {
            if (!mapUrlToInstance.has(name)) {
                // If we're on localhost, force use `ms` KC domain
                // Otherwise, KC endpoint should be reverse proxied on the current domain at `/keycloak`
                // TODO: If we install a reverse proxy to localhost, apps should work without this condition
                const origin = isDevelopment() ? domains.ms.origin : getLocation('origin');
                const instance = createKeycloakInstance({
                    realm: domains[name].keycloakRealm,
                    url: `${origin}/keycloak/`,
                    clientId: 'frontend',
                });

                initKeycloakInstanceEffects(ctx, name, instance);

                mapUrlToInstance.set(name, instance);
            }

            return mapUrlToInstance.get(name)!;
        }

        register(keycloakLoginDescriptor, ({ name }) =>
            execFunctionWithLock(keycloakLoginDescriptor.name, getInstance(name).login).pipe(
                map(createSyncedValueDescriptor),
            ),
        );
        register(keycloakLogoutDescriptor, ({ name }) =>
            execFunctionWithLock(keycloakLogoutDescriptor.name, getInstance(name).logout).pipe(
                map(createSyncedValueDescriptor),
            ),
        );
        register(keycloakReloginDescriptor, ({ name }) =>
            execFunctionWithLock(keycloakReloginDescriptor.name, getInstance(name).refreshToken),
        );
    });
}
