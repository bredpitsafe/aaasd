import type { InterfaceToType, Opaque } from '@common/types';
import type { KeycloakProfile } from 'keycloak-js';

export type TKeycloakProfile = InterfaceToType<KeycloakProfile>;
export type TKeycloakToken = Opaque<'KeycloakToken', string>;

export enum EDomainName {
    Ms = 'ms',
    Prod = 'prod',
}

export const DOMAIN_NAMES = [EDomainName.Ms, EDomainName.Prod] as const;
