import type { TContextRef } from '../../di';
import { ModuleActor } from '../../modules/actor';
import type { EDomainName } from '../../types/domain/evironment.ts';
import type { TKeycloakInstance } from './createKeycloakInstance.ts';
import { publishToKeycloakProfileEnvBox, publishToKeycloakTokenEnvBox } from './descriptors.ts';

export function initKeycloakInstanceEffects(
    ctx: TContextRef,
    name: EDomainName,
    instance: TKeycloakInstance,
) {
    const actor = ModuleActor(ctx);

    instance.keycloakProfile$.subscribe((profile) => {
        publishToKeycloakProfileEnvBox.send(actor, {
            name,
            profile,
        });
    });

    instance.keycloakToken$.subscribe((token) => {
        publishToKeycloakTokenEnvBox.send(actor, {
            name,
            token,
        });
    });
}
