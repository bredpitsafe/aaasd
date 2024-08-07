export const embedContextToMessage = (
    context: string | Function,
    messageBuilder: (message: string) => string = function defaultMessageWithContext(
        message: string,
    ) {
        return `\`${typeof context === 'function' ? context.name : context}\` - ${message}`;
    },
) => ({ messageWithContext: messageBuilder });

export const shortenLoggingArray = <T>(items?: T[], length = 5): T[] =>
    items?.slice(0, length) || [];
