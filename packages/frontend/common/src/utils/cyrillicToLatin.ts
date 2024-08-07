const map = new Map<string, string>(
    Object.entries({
        Ф: 'A',
        И: 'B',
        С: 'C',
        В: 'D',
        У: 'E',
        А: 'F',
        П: 'G',
        Р: 'H',
        Ш: 'I',
        О: 'J',
        Л: 'K',
        Д: 'L',
        Ь: 'M',
        Т: 'N',
        Щ: 'O',
        З: 'P',
        Й: 'Q',
        К: 'R',
        Ы: 'S',
        Е: 'T',
        Г: 'U',
        М: 'V',
        Ц: 'W',
        Ч: 'X',
        Н: 'Y',
        Я: 'Z',
    }),
);

export const cyrillicToLatin = (string: string): string => {
    return string
        .split('')
        .map((char) => {
            const upper = char.toUpperCase();
            const isUpper = char === upper;
            if (map.has(upper)) {
                const char = map.get(upper);
                return isUpper ? char : char?.toLowerCase();
            }

            return char;
        })
        .join('');
};
