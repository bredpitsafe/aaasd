'use server';

import { firstValueFrom, map } from 'rxjs';

import type { TRiskSettings } from '../def';
import type { TServerActionResponse } from '../def/actions';
import { runServerAction } from '../lib/actions';
import { parseXMLToRiskSettings } from '../lib/xml/parse';
import { getConfig } from './getConfig';

export async function getFormData(): Promise<TServerActionResponse<TRiskSettings | undefined>> {
    return runServerAction((traceId) =>
        firstValueFrom(
            getConfig(traceId).pipe(
                map((envelope) => parseXMLToRiskSettings(envelope.payload.config)),
            ),
        ),
    );
}
