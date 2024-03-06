export const mapRequired = <T>(items: T[] | undefined): Required<T>[] => {
    return items?.map((item) => item as Required<typeof item>) ?? [];
};
