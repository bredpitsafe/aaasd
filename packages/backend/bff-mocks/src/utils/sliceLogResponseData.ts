import { isNil } from 'lodash-es';

export const sliceLogResponseData = (data: unknown): string | undefined => {
    const LIMIT = 100;
    const raw = JSON.stringify(data);
    if (isNil(raw)) {
        return;
    }
    const rawLength = raw.length;
    if (rawLength <= LIMIT) {
        return raw;
    }

    return `${raw.slice(0, LIMIT)}...(+${rawLength - LIMIT})`;
};
