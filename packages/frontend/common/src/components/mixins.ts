export function withBorder(border: string): object {
    return {
        [border]: `1px solid #d9d9d9`,
        boxShadow: '0 2px 0 rgb(0 0 0 / 2%)',
    };
}
