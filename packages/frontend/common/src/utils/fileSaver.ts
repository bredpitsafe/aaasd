import FileSaver from 'file-saver';

export function saveAsJSON(obj: object, name: string, options?: { pretty?: boolean }): void {
    const string = options?.pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);

    saveAsString(string, name, 'json');
}

export function saveAsString(value: string, name: string, ext: string): void {
    const blob = new Blob([value], {
        type: 'application/json;charset=utf-8',
    });
    FileSaver.saveAs(blob, `${name}.${ext}`);
}

export function getTextFromBlob(blob: Blob, encoding = 'utf-8'): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.onerror = (e) => {
            reject(e);
        };
        reader.readAsText(blob, encoding);
    });
}
