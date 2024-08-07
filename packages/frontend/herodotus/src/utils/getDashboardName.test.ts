import type { THerodotusTaskId } from '../types/domain';
import { getDashboardName } from './getDashboardName';

describe('getDashboardName', () => {
    it('should return dashboard name if exists', () => {
        const task = { dashboardName: 'T1234', taskId: 1234 as THerodotusTaskId };
        expect(getDashboardName(task)).toBe(task.dashboardName);
    });

    it('should generate dashboard name from task id (short)', () => {
        const task = { taskId: 12 as THerodotusTaskId };
        expect(getDashboardName(task)).toBe('T0012');
    });

    it('should generate dashboard name from task id (medium)', () => {
        const task = { taskId: 1234 as THerodotusTaskId };
        expect(getDashboardName(task)).toBe('T1234');
    });

    it('should generate dashboard name from task id (long)', () => {
        const task = { taskId: 123456 as THerodotusTaskId };
        expect(getDashboardName(task)).toBe('T123456');
    });
});
