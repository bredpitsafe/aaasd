import type { TFail } from './Fail';
import type { TStructurallyCloneable } from './serialization';

/**
 * @deprecated
 */
export enum EValueDescriptorState {
    Idle = 'Idle',
    Unsynchronized = 'Unsynchronized',
    Synchronized = 'Synchronized',
    Fail = 'Fail',
}

/**
 * @deprecated
 */
export type ValueDescriptor<
    T,
    F extends TFail<string, undefined | TStructurallyCloneable>,
    P = null,
> =
    | {
          state: EValueDescriptorState.Idle;
          value: null;
          fail: null;
          progress: null;
      }
    | {
          state: EValueDescriptorState.Unsynchronized;
          value: T | null;
          fail: F | null;
          progress: P;
      }
    | {
          state: EValueDescriptorState.Synchronized;
          value: T;
          fail: F | null;
          progress: P;
      }
    | {
          state: EValueDescriptorState.Fail;
          value: T | null;
          fail: F;
          progress: P | null;
      };
