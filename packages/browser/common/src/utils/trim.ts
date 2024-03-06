export function trimRight(str: string, v = ' '): string {
    let i = 1;

    while (str[str.length - i] === v) {
        i++;
    }

    return str.substr(0, str.length - i + 1);
}
