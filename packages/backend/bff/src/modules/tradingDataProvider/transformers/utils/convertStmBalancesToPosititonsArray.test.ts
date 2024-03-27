import { describe, expect, it } from 'vitest';

import { stmBalance } from '../fixtures/stmBalance.ts';
import { convertStmBalancesToPositionsArray } from './convertStmBalancesToPositionsArray.ts';

describe('convertStmBalancesToPositionsArray', () => {
    it('converts data correctly', () => {
        expect(convertStmBalancesToPositionsArray([stmBalance])).toMatchSnapshot();
    });
    it('converts undefined to empty array', () => {
        expect(convertStmBalancesToPositionsArray()).toEqual([]);
    });
});
