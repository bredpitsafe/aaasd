export enum EDataType {
    XML = 'XML',
    JSON = 'JSON',
    Base64 = 'Base64',
}

export function isJSON(value: string): boolean {
    const trimmed = value.trimStart();
    return trimmed.startsWith('{') || trimmed.startsWith('//');
}

export function isXML(value: string): boolean {
    return value.trimStart()[0] === '<';
}
