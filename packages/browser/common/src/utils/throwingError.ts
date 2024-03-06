export function throwingError<Err extends string | Error>(err: Err): never {
    throw typeof err === 'string' ? new Error(err) : err;
}
