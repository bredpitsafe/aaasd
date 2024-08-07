import domains from '../../../../../configs/domains.json';

export function isDevelopment(): boolean {
    return process.env.NODE_ENV !== 'production';
}

export function isProduction(): boolean {
    return !isDevelopment();
}

export function isMultiPortDevelopment(): boolean {
    return isDevelopment() && self.location.port != process.env.DEV_PORT_DEFAULT;
}

export function isRunningInIframe(): boolean {
    return window.top !== window.self;
}

export function isBrowser(): boolean {
    return typeof window !== 'undefined';
}

export function isMultiStageDomain(): boolean {
    return self.location.origin === domains.ms.origin;
}
export function isProductionDomain(): boolean {
    return isProduction() && self.location.origin === domains.prod.origin;
}
