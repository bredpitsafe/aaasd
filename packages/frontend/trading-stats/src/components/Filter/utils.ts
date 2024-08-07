export function getTabName(name: string, ...values: (number[] | string[] | undefined)[]): string {
    return hasFilledFilters(values) ? `${name} *` : name;
}

function hasFilledFilters(values: (number[] | string[] | undefined)[]): boolean {
    return values.some((value) => value?.length);
}
