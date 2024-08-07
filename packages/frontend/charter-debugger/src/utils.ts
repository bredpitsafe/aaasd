import type { TSocketName } from '@frontend/common/src/types/domain/sockets';

import sockets from '../../../../configs/urls.json';

export const SOCKETS = sockets as Record<TSocketName, string>;

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
