/**
 * @public
 */
export type TServerActionResult<T> = {
    state: 'success';
    data: T;
};

export type TServerActionError = {
    state: 'error';
    error: string;
};

export type TServerActionResponse<T> = TServerActionResult<T> | TServerActionError;
