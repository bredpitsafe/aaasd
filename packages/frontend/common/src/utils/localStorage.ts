import { isNil } from 'lodash-es';

export const setLocalStorageValue = (storageKey: string, value: string) => {
    localStorage.setItem(storageKey, JSON.stringify(value));
};

export const deleteLocalStorageValue = (storageKey: string) => {
    localStorage.removeItem(storageKey);
};

export const getLocalStorageValue = (storageKey: string) => {
    const stringValue = localStorage.getItem(storageKey);

    return isNil(stringValue) || stringValue === '' ? undefined : JSON.parse(stringValue);
};
