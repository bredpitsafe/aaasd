import type { TBase64 } from '@common/utils/src/base64';
import { base64ToObject, objectToBase64 } from '@common/utils/src/base64';
import { ETableSearchParams } from '@frontend/common/src/modules/router/defs';
import { extractValidFilter } from '@frontend/common/src/modules/router/encoders';
import { isNil } from 'lodash-es';
import type { BaseLinkProps } from 'react-router5/dist/BaseLink';

export function getLinkParams(
    linkParams?: BaseLinkProps['routeParams'],
    routeStateParams?: BaseLinkProps['routeParams'],
) {
    try {
        linkParams = linkParams ?? {};
        routeStateParams = routeStateParams ?? {};

        const existTableFilters = !isNil(routeStateParams?.[ETableSearchParams.TableFilter])
            ? base64ToObject(
                  extractValidFilter(routeStateParams?.[ETableSearchParams.TableFilter]) as TBase64<
                      Record<string, unknown>
                  >,
              )
            : {};

        const linkTableFilters = base64ToObject(
            extractValidFilter(linkParams?.[ETableSearchParams.TableFilter]) as TBase64<
                Record<string, unknown>
            >,
        );

        return {
            ...routeStateParams,
            ...linkParams,
            [ETableSearchParams.TableFilter]: objectToBase64({
                ...existTableFilters,
                ...linkTableFilters,
            }),
        };
    } catch {
        return {};
    }
}
