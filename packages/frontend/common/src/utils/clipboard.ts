export async function clipboardWrite(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard === undefined && navigator.permissions) {
            await navigator.permissions.query({
                name: 'clipboard-write' as PermissionName,
            });
        }

        if (navigator.clipboard === undefined) {
            fallbackCopyTextToClipboard(text);
        } else {
            await navigator.clipboard.writeText(text);
        }

        return true;
    } catch (err) {
        throw err;
    }
}

function fallbackCopyTextToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        if (!document.execCommand('copy')) {
            throw new Error(`Fallback clipboard: unsuccess execCommand(copy)`);
        }
    } finally {
        document.body.removeChild(textArea);
    }
}

export async function clipboardRead(): Promise<string> {
    const permission = await navigator.permissions.query({
        name: 'clipboard-read' as PermissionName,
    });

    if (permission.state === 'denied') {
        throw new Error('Not allowed to read clipboard.');
    }

    return await navigator.clipboard.readText();
}
