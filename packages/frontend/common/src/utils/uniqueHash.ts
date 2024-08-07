import { v4 } from 'uuid';

export const uniqueHash = {
    get: () => v4(),
};
