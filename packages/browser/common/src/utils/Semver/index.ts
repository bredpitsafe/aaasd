import type { TSemverVersion } from './def';

export function isValidSemverVersion(str: string): boolean {
    return /^v?([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/.test(
        str,
    );
}

export function getMajorVersion(version: TSemverVersion): number {
    return parseInt(version, 10);
}

export function getMinorVersion(version: TSemverVersion): number {
    const minorStart = version.indexOf('.');
    const minorEnd = version.indexOf('.', minorStart + 1);

    return parseInt(version.substring(minorStart + 1, minorEnd), 10);
}

export function extractValidSemverVersion(
    str: undefined | null | string,
): undefined | TSemverVersion {
    return typeof str === 'string'
        ? isValidSemverVersion(str)
            ? (str as TSemverVersion)
            : undefined
        : undefined;
}
