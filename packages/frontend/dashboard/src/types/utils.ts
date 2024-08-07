export function keyExists<T>(obj: unknown, key: keyof T, ...keys: (keyof T)[]): obj is T {
    return (
        key in (obj as object) && (keys.length === 0 || keys.every((key) => key in (obj as object)))
    );
}
