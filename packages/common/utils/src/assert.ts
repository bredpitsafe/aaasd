/**
 * Function is a type guard utility, ensures that all possible cases of a union type are handled. This function is
 * intended to be used in situations where a value is expected to be of a specific union type and any value outside that
 * scope indicates a programming error.
 *
 * It throws an error when invoked, carrying a message that includes the unexpected value. This helps catch unhandled
 * cases during development, ensuring that the code is robust and all scenarios are accounted for.
 *
 * @param value - A value of type `never`, meaning this function should only be called when all cases have been checked.
 *
 * @throws Error - Throws an error when invoked with an unexpected value.
 *
 * @example
 * ```typescript
 * const val: '1' | '2' = '1';
 *
 * switch (val) {
 *     case '1':
 *         console.log("Value is 1");
 *         break;
 *     case '2':
 *         console.log("Value is 2");
 *         break;
 *     default:
 *         assertNever(val); // This will throw an error if `val` has an unexpected value
 * }
 * ```
 */
export function assertNever(value: never): never {
    throw new Error(`assertNever invocation, unexpected value: ${value}`);
}

/**
 * Asserts that a given condition is true. If the condition is false, an error is thrown with an optional message. This
 * function is typically used for runtime checks to validate assumptions in the code.
 *
 * @param condition - A boolean expression that is expected to be true.
 * @param message - An optional string that provides context for the failure.
 *
 * @throws Error - Throws an error if the condition is false, with the given message or a default message.
 *
 * @example
 * ```typescript
 * function divide(x: number, y: number): number {
 *     assert(y !== 0, 'Denominator must not be zero');
 *     return x / y;
 * }
 *
 * const result = divide(10, 2); // Returns 5
 * const invalidResult = divide(10, 0); // Throws an error: "Denominator must not be zero"
 * ```
 */
export function assert(condition: boolean, message?: string): asserts condition {
    if (!condition) {
        throw new Error(message || 'assertion failed');
    }
}

/**
 * Throws an error indicating that an unexpected value was encountered. This function is used as a fail-safe mechanism
 * in code paths where logic should not reach under normal conditions (e.g., exhaustive checks for union types).
 *
 * When invoked, it throws an error with a message that includes details of the unexpected value. This helps with
 * debugging and identifying where the violation occurred.
 *
 * @param value - An optional value that caused the failure. It can be of any type and will be included in the error
 * message for context.
 *
 * @throws Error - Always throws an error indicating an unexpected value.
 *
 * @example
 * ```typescript
 * type Color = 'red' | 'green' | 'blue';
 *
 * function getColorCode(color: Color): string {
 *     switch (color) {
 *         case 'red':
 *             return '#FF0000';
 *         case 'green':
 *             return '#00FF00';
 *         case 'blue':
 *             return '#0000FF';
 *         default:
 *             assertFail(color); // Throws an error for any unexpected value
 *     }
 * }
 *
 * getColorCode('red'); // Returns '#FF0000'
 * getColorCode('yellow'); // Throws an error: "Unexpected value: yellow"
 * ```
 */
export function assertFail(value?: unknown): never {
    throw new Error(`Unexpected value: ${value}`);
}
