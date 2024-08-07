import type { Nil } from '@common/types';

export const TEST_DATA_KEY_NAME = 'test' as const;
export const TEST_KEY_NAME = `data-${TEST_DATA_KEY_NAME}` as const;

export type TWithTest = {
    [TEST_KEY_NAME]?: string;
};

export function createTestProps(key: string): TWithTest {
    return { [`${TEST_KEY_NAME}`]: key } as TWithTest;
}

export function pickTestProps<T extends object & TWithTest>(props: T): TWithTest {
    return { [`${TEST_KEY_NAME}`]: props[TEST_KEY_NAME] } as TWithTest;
}

export function testSelector(key: string): string {
    return `[${TEST_KEY_NAME}="${key}"]`;
}

export function injectToDataset(element: HTMLElement, key: string): void {
    element.dataset[TEST_DATA_KEY_NAME] = key;
}

export function createTestClassName(values: Nil | number | string): string {
    return `test[${values}]`;
}

export function extractTestValues(className: string): string[] {
    return [...className.matchAll(/test\[([^=\]]*)\]/gm ?? [])].map((v) => v.slice(1)).flat();
}
