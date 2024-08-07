import type { TWithChildren } from '@frontend/common/src/types/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isMatch, isNil, omit } from 'lodash-es';
import type { KeyboardEvent } from 'react';
import { memo, useContext, useEffect, useMemo, useState } from 'react';
import { useEvent } from 'react-use';

import { HotKeyActionContext } from './context';
import type { THotKey, THotKeyActionContext } from './defs';

export const HotKeyActionSettings = memo(({ children }: TWithChildren) => {
    const [actionsDesc, setActionsDesc] = useState<
        Record<
            string,
            {
                count: number;
                hotKey: THotKey;
                updateSettings: (state: unknown) => unknown;
            }
        >
    >({});

    const [allData, setAllData] = useState<Record<string, unknown>>({});

    const register = useFunction(
        (command: string, hotKey: THotKey, updateSettings: (current: unknown) => unknown) => {
            setActionsDesc((state) => {
                const actionDesc = state[command];

                return {
                    ...state,
                    [command]: {
                        count: (actionDesc?.count ?? 0) + 1,
                        hotKey,
                        updateSettings,
                    },
                };
            });

            return () => {
                setActionsDesc((state) => {
                    const actionDesc = state[command];

                    if (isNil(actionDesc) || actionDesc.count <= 1) {
                        return omit(state, command);
                    }

                    return {
                        ...state,
                        [command]: {
                            ...actionDesc,
                            count: actionDesc.count - 1,
                        },
                    };
                });
            };
        },
    );

    const context = useMemo(
        () => ({
            register: register as THotKeyActionContext['register'],
            data: allData,
        }),
        [register, allData],
    );

    const handleKeyPress = useFunction((e: KeyboardEvent) => {
        const newAllData = { ...allData };

        for (const [key, { hotKey, updateSettings }] of Object.entries(actionsDesc)) {
            if (isMatch(e, hotKey)) {
                newAllData[key] = updateSettings(newAllData[key]);

                const { activeElement } = document;
                if (isNil(activeElement) || activeElement === document.body) {
                    e.preventDefault();
                }
            }
        }

        setAllData(newAllData);
    });

    useEvent('keydown', handleKeyPress);

    useEffect(() => {
        let newAllData = allData;

        for (const key in allData) {
            if (key in actionsDesc) {
                continue;
            }

            newAllData = omit(newAllData, key);
        }

        if (newAllData !== allData) {
            setAllData(newAllData);
        }
    }, [actionsDesc, allData, setAllData]);

    return <HotKeyActionContext.Provider value={context}>{children}</HotKeyActionContext.Provider>;
});

export function useRegisterHotKeyAction<T>(
    command: string,
    hotKey: THotKey,
    updateSettings: (current: T | undefined) => T,
) {
    const register = useContext(HotKeyActionContext)?.register;

    useEffect(() => {
        if (isNil(register)) {
            return;
        }

        return register(command, hotKey, updateSettings);
    }, [register, command, hotKey, updateSettings]);
}

export function useHotKeyActionData<T>(command: string): T | undefined;
export function useHotKeyActionData<T>(command: string, defaultValue: T): T;
export function useHotKeyActionData<T>(command: string, defaultValue?: T): T | undefined {
    return (useContext(HotKeyActionContext)?.data?.[command] as T | undefined) ?? defaultValue;
}
