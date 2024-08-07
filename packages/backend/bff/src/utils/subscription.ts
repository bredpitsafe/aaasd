import type { ISO } from '@common/types';
import { assert, assertNever } from '@common/utils';
import { extractValidNumber } from '@common/utils/extract.ts';
import { isNil } from 'lodash-es';

import { ERpcSubscriptionEvent } from '../def/rpc.ts';
import { mapRequired } from './mapRequired.ts';

type TRpcSubscriptionPayload<T, R> =
    | {
          type: 'ok';
          ok: {
              platformTime?: string | undefined;
          };
      }
    | {
          type: 'snapshot';
          snapshot: {
              entities?: T[] | undefined;
              total?: number | undefined;
              platformTime?: string | undefined;
          };
      }
    | {
          type: 'updates';
          updates: {
              upserted?: T[] | undefined;
              removed?: R[] | undefined;
          };
      }
    | undefined;

export type TSubscriptionResponse<T, R> =
    | {
          type: ERpcSubscriptionEvent.Ok;
          platformTime: ISO | undefined;
      }
    | {
          type: ERpcSubscriptionEvent.Snapshot;
          snapshot: T[];
          total?: number;
          platformTime: ISO;
      }
    | {
          type: ERpcSubscriptionEvent.Updates;
          upserted?: T[];
          removed?: R[];
      };

export const mapRpcSubscriptionEventToResponse = <T, R>(
    response?: TRpcSubscriptionPayload<T, R>,
): TSubscriptionResponse<T, R> => {
    assert(!isNil(response), `Response can't be empty`);

    switch (response.type) {
        case 'ok': {
            return {
                type: ERpcSubscriptionEvent.Ok,
                platformTime: response.ok.platformTime as ISO,
            };
        }
        case 'snapshot': {
            return {
                type: ERpcSubscriptionEvent.Snapshot,
                snapshot: mapRequired(response.snapshot.entities),
                total: extractValidNumber(response.snapshot.total),
                platformTime: response.snapshot.platformTime as ISO,
            };
        }
        case 'updates': {
            return {
                type: ERpcSubscriptionEvent.Updates,
                upserted: mapRequired(response.updates.upserted),
                removed: mapRequired(response.updates.removed),
            };
        }
        default: {
            assertNever(response);
        }
    }
};
