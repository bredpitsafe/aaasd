const SEPARATOR = '@';

export function uniqualizeProcedureNames<T extends {}>(postfix: string, map: T) {
    Object.entries(map).forEach(([k, v]) => {
        // @ts-ignore
        map[k] = `${v}${SEPARATOR}${postfix}`;
        // @ts-ignore
        map[`${v}${SEPARATOR}${postfix}`] = k;
    });
}

export function purifyProcedureName(name: string): string {
    return name.substring(0, name.indexOf(SEPARATOR));
}
