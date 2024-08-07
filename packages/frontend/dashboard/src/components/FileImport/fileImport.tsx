import {
    DashboardPageProps,
    EDashboardPageSelectors,
} from '@frontend/common/e2e/selectors/dashboard/dashboard.page.selectors';
import { getTextFromBlob } from '@frontend/common/src/utils/fileSaver';
import { isFunction } from 'lodash-es';
import type { ChangeEvent, ForwardedRef, ReactNode } from 'react';
import { forwardRef, useCallback, useEffect, useRef } from 'react';

import { cnForm } from './fileImport.css';

interface IInputChangeEvent extends ChangeEvent {
    target: HTMLInputElement & EventTarget;
}

export const FileImport = forwardRef(
    (
        {
            children,
            onImportFile,
        }: {
            children: ReactNode;
            onImportFile?: (file: string) => void;
        },
        commandsRef: ForwardedRef<{ showWindow: () => void }>,
    ) => {
        const formRef = useRef<HTMLFormElement>(null);
        const inputRef = useRef<HTMLInputElement>(null);

        const cbUpload = useCallback(
            async (e: IInputChangeEvent): Promise<void> => {
                if (e?.target?.files?.length === 0) {
                    return;
                }

                const fileContents = await getTextFromBlob(e.target.files![0]);

                onImportFile?.(fileContents);
                // Reset selected file in the input
                // to trigger onChange callback even when selecting the same file again
                formRef?.current?.reset();
            },
            [onImportFile],
        );

        useEffect(() => {
            if (!commandsRef) {
                return;
            }

            const refObject = {
                showWindow() {
                    inputRef?.current?.click();
                },
            };

            if (isFunction(commandsRef)) {
                commandsRef(refObject);
            } else {
                commandsRef.current = refObject;
            }
        }, [commandsRef]);

        return (
            <>
                {children}

                <form ref={formRef} className={cnForm}>
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".xml,.json"
                        onChange={cbUpload}
                        {...DashboardPageProps[EDashboardPageSelectors.ImportFileInput]}
                    />
                </form>
            </>
        );
    },
);
