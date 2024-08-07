'use server';

import { assert } from '@frontend/common/src/utils/assert';
import { isEmpty, isEqual } from 'lodash-es';
import { firstValueFrom, map, switchMap, throwError } from 'rxjs';

import type { TRiskSettings, TXmlRiskSettings } from '../def';
import type { TServerActionResponse } from '../def/actions';
import { updateConfigHandle } from '../handlers/updateConfigHandle';
import { runServerAction } from '../lib/actions';
import { config } from '../lib/config';
import { fetchHandler } from '../lib/socket';
import { buildXML } from '../lib/xml/build';
import { mapGroupToXmlGroup } from '../lib/xml/converters';
import { parseXML } from '../lib/xml/parse';
import { getConfig } from './getConfig';

export async function setFormData(formData: TRiskSettings): Promise<TServerActionResponse<void>> {
    return runServerAction((traceId) =>
        firstValueFrom(
            getConfig(traceId).pipe(
                switchMap((envelope) => {
                    const oldConfig = parseXML(envelope.payload.config);
                    const newConfig: TXmlRiskSettings = {
                        ...oldConfig,
                        execution_gate: {
                            ...oldConfig.execution_gate,
                            risk_management_limits: {
                                group: formData.group?.map(mapGroupToXmlGroup),
                            },
                        },
                    };

                    // Check equality to prevent useless updates
                    if (isEqual(oldConfig.execution_gate?.risk_management_limits, formData)) {
                        return throwError(
                            () => new Error('Configuration is identical to the current setup'),
                        );
                    }

                    const xml = buildXML(newConfig);
                    assert(!isEmpty(xml), 'resulting configuration is empty');

                    return updateConfigHandle(
                        fetchHandler,
                        config.server.component.socket,
                        config.server.component.id,
                        buildXML(newConfig),
                        envelope.payload.digest,
                        {
                            traceId,
                        },
                    );
                }),
                map(() => undefined),
            ),
        ),
    );
}
