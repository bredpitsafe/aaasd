import type { ErrorObject } from 'ajv';
import ajvModule from 'ajv';

import commonSchema from '../schemas/common.json' assert { type: 'json' };
import requestSchema from '../schemas/request.json' assert { type: 'json' };

type TValidateRequestSchemaReturnType = {
    result: boolean;
    errors: ErrorObject[];
};

const ajv = new ajvModule.default({
    allowUnionTypes: true,
    strict: false,
});

ajv.addSchema(commonSchema, 'common.json');
const validateRequest = ajv.compile(requestSchema);

export function validateRequestSchema(request: object): TValidateRequestSchemaReturnType {
    const result = validateRequest(request);
    return { result, errors: validateRequest.errors ?? [] };
}
