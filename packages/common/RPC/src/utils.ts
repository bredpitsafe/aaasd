const SEPARATOR = '@';

export function uniqualizeProcedureNames<T extends {}>(postfix: string, map: T) {
    Object.entries(map).forEach(([k, v]) => {
        // @ts-ignore
        map[k] = `${v}${SEPARATOR}${postfix}`;
        // @ts-ignore
        map[`${v}${SEPARATOR}${postfix}`] = k;
    });
}

export function cleanProcedureName(procedureName: string) {
    return procedureName.split(SEPARATOR)[0];
}
