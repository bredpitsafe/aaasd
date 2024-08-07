import type { IToStructurallyCloneableError, TStructurallyCloneableError } from './serialization';

export class StructurallyCloneableError extends Error implements IToStructurallyCloneableError {
    protected static prefix = 'StructurallyCloneableError';

    public static isStructurallyCloneableError(v: unknown): v is TStructurallyCloneableError {
        return v instanceof Error && v.message.startsWith(this.prefix);
    }

    public static fromStructurallyCloneableError(
        error: TStructurallyCloneableError,
    ): StructurallyCloneableError {
        const props = JSON.parse(error.message.slice(this.prefix.length + 1));
        const customError = new this(props.message, props);

        customError.stack = error.stack;

        return customError;
    }

    public toStructurallyCloneable(): TStructurallyCloneableError {
        const prefix = Object.getPrototypeOf(this).constructor.prefix;
        const err = new Error(`${prefix}|${JSON.stringify(this.toJSON())}`);

        err.stack = this.stack;

        return err;
    }

    public toJSON(): object {
        return {
            message: this.message,
            cause: this.cause instanceof Error ? this.cause : undefined,
        };
    }
}
