import { describe, expect, it } from 'vitest';

import { stmBalance } from '../fixtures/stmBalance.ts';
import { convertStmBalancesToBalancesArray } from './convertStmBalancesToBalancesArray.ts';

describe('convertStmBalancesToBalancesArray', () => {
    it('converts data correctly', () => {
        expect(convertStmBalancesToBalancesArray([stmBalance])).toMatchSnapshot();
    });
    it('converts undefined to empty array', () => {
        expect(convertStmBalancesToBalancesArray()).toEqual([]);
    });
});
