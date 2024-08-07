import type { TServerActionError, TServerActionResponse } from '../../def/actions';

export async function getServerActionResponse<T>(
    promise: Promise<TServerActionResponse<T>>,
): Promise<T> {
    const result = await promise;
    if (isServerActionError(result)) {
        throw new Error(result.error);
    }
    return result.data;
}

function isServerActionError<T>(
    response: TServerActionResponse<T>,
): response is TServerActionError {
    return response.state === 'error';
}
