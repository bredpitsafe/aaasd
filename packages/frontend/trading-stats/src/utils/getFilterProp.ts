import { isEmpty } from 'lodash-es';

export function getFilterProp<F, P extends keyof F>(filters: F, prop: P): undefined | F[P] {
    return isEmpty(filters[prop]) ? undefined : filters[prop];
}
