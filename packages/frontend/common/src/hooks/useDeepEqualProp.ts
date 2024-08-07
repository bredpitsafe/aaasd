import { useState } from 'react';
import { useDeepCompareEffect } from 'react-use';

export function useDeepEqualProp<T extends object | unknown[] | undefined>(obj: T): T {
    const [res, setRes] = useState<T>(obj);
    useDeepCompareEffect(() => {
        setRes(obj);
    }, [obj]);

    return res;
}
