import { isNil } from 'lodash-es';

import environmentsWithoutAuthRequered from '../../../../../configs/authNotRequired.environments.json';
import domains from '../../../../../configs/domains.json';
import productionEnvironments from '../../../../../configs/prod.environments.json';
import type { TSocketName, TSocketURL } from '../types/domain/sockets';
import { isDevelopment } from './environment';

const ENVS_AUTH_NOT_REQUIRED = environmentsWithoutAuthRequered.list as TSocketName[];

const schemaRegexp = /^\w+:\/\//;

export function hasUrlSchema(url: string): boolean {
    return schemaRegexp.test(url);
}

export function hasWebSocketSchema(url: string): boolean {
    return hasUrlSchema(url) && url.startsWith('ws');
}

export function changeUrlSchema(url: string, schema: string): string {
    return hasUrlSchema(url) ? url.replace(schemaRegexp, schema + '://') : schema + '://' + url;
}

export function changeUrlToSocketUrl(url: string, defaultSchema: string): string {
    return hasWebSocketSchema(url) ? url : changeUrlSchema(url, defaultSchema);
}

export function isSecureLocation(): boolean {
    return self.location.protocol.startsWith('https');
}

export function getBuildId() {
    if (isDevelopment()) {
        return 'dev';
    }
    return self.location.pathname.split('/').at(1);
}

export function buildStorageExportUrl(domain: string) {
    const buildId = getBuildId();
    return `${domain}/${buildId}/dist/dashboard.html/storage/export`;
}

export function getProductionSocketsList(): TSocketName[] {
    return productionEnvironments.list as TSocketName[];
}

export function isAuthRequiredSocket(socket: TSocketName): boolean {
    return !ENVS_AUTH_NOT_REQUIRED.includes(socket);
}

export function isProdEnvironment(socket?: TSocketName): undefined | boolean {
    if (isNil(socket)) {
        return;
    }

    return getProductionSocketsList().includes(socket);
}

export function getValidSocketUrl(url: TSocketURL): TSocketURL {
    const isSecure = isSecureLocation();
    const correctSchema = isSecure ? 'wss://' : 'ws://';

    // It's a fully correct URL, proceed
    if (url.startsWith(correctSchema)) {
        return url;
    }

    let domain = '';
    // We're provided with a path to socket instead of a full URL
    // Should set a valid domain
    if (url.startsWith('/')) {
        domain = isDevelopment() ? new URL(domains.ms.origin).hostname : window.location.hostname;
    }
    // Find and replace incorrect schema and add domain if necessary
    const re = /^(wss?:\/\/)?(.*)$/i;
    const match = re.exec(url);
    if (match !== null) {
        return `${correctSchema}${domain}${match[2]}` as TSocketURL;
    }
    return url;
}
