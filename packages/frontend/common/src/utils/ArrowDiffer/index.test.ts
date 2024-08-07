import { ArrowDiffer } from './index';

type TItem = { key: number };

function generateItems(length: number, shift: number): TItem[] {
    return new Array(length).fill(0).map((_, i) => {
        return {
            key: i + shift,
        };
    });
}

describe('ArrowDiffer', () => {
    const arrowDiffer = new ArrowDiffer(({ key }: TItem) => key);

    it('should return added,remove,updated items', () => {
        const items1 = generateItems(10, 0);
        const items2 = generateItems(1, 0);
        const items3Shift = 1;
        const items3 = generateItems(5, items3Shift);
        const items4Shift = 2;
        const items4 = generateItems(2, items4Shift);

        {
            const { added, updated, deleted } = arrowDiffer.nextState(items1);
            expect(added.length).toBe(items1.length);
            expect(updated.length).toBe(0);
            expect(deleted.length).toBe(0);
        }

        {
            const { added, updated, deleted } = arrowDiffer.nextState(items2);
            expect(added.length).toBe(0);
            expect(updated.length).toBe(1);
            expect(updated[0]).toBe(items2[0]);
            expect(deleted.length).toBe(9);

            deleted.forEach((deletedItem, i) => {
                expect(deletedItem).toBe(items1[i + 1]);
            });
        }

        {
            const { added, updated, deleted } = arrowDiffer.nextState(items3);
            expect(added.length).toBe(items3.length);
            expect(updated.length).toBe(0);
            expect(deleted.length).toBe(1);
        }

        {
            const { added, updated, deleted } = arrowDiffer.nextState(items4);
            expect(added.length).toBe(0);
            expect(updated.length).toBe(2);
            expect(deleted.length).toBe(3);

            updated.forEach((updatedItem, i) => {
                expect(updatedItem).toBe(items4[i]);
            });

            expect(deleted[0].key).toBe(1);
            expect(deleted[1].key).toBe(4);
            expect(deleted[2].key).toBe(5);
        }
    });
});
