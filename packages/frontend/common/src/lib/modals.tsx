import type { ModalFuncProps } from 'antd';
import type { FunctionComponent, ReactElement } from 'react';
import type React from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';

import { EModalProps, EModalSelectors } from '../../e2e/selectors/modal.selectors';
import { Input } from '../components/Input';
import { Modal } from '../components/Modals';
import type { TContextRef } from '../di';
import { ModuleFactory } from '../di';
import { DIProvider } from '../di/react';
import { conditionWaiting } from '../utils/conditionWaiting';

const ID = 'ModalsContainer';

export interface IModalShowResult {
    destroy: () => void;
}

export type IModuleModals = {
    Container: FunctionComponent;
    show(element: ReactElement): IModalShowResult;
    confirm: typeof confirm;
    confirmWithInput: typeof confirmWithInput;
};

function show(context: TContextRef, element: ReactElement) {
    let root: Root | null = null;
    let destroyed = false;

    conditionWaiting<HTMLElement>(() => document.getElementById(ID)).then((el) => {
        if (!destroyed) {
            root = createRoot(el);
            root.render(<DIProvider context={context}>{element}</DIProvider>);
        }
    });

    return {
        destroy() {
            destroyed = true;
            root && root.unmount();
        },
    };
}

function ModalsContainer(): ReactElement {
    return <div id={ID}></div>;
}

export function createModule(context: TContextRef): IModuleModals {
    return {
        Container: ModalsContainer,
        show: show.bind(null, context),
        confirm,
        confirmWithInput,
    };
}

export function confirm(content: string, modalProps?: ModalFuncProps): Promise<boolean> {
    return new Promise<boolean>((resolve) =>
        Modal.confirm({
            content,
            closable: true,
            maskClosable: true,
            onOk() {
                resolve(true);
            },
            onCancel() {
                resolve(false);
            },
            ...modalProps,
        }),
    );
}

export function confirmWithInput(
    title: string,
    value: string,
    modalProps?: ModalFuncProps,
): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        const updateModalProps: React.ChangeEventHandler<HTMLInputElement> = (e) => {
            const disabled = value !== e.target.value;
            update({ okButtonProps: { disabled: value !== e.target.value, danger: !disabled } });
        };

        const inputNode = (
            <Input
                {...EModalProps[EModalSelectors.NameComponentInput]}
                onChange={updateModalProps}
                placeholder={`Type '${value}' to confirm action`}
            />
        );

        const { update } = Modal.confirm({
            content: (
                <>
                    <div>{title}</div>
                    <div>{inputNode}</div>
                </>
            ),
            closable: true,
            maskClosable: true,
            onOk() {
                resolve(true);
            },
            onCancel() {
                resolve(false);
            },
            okButtonProps: { disabled: true },
            ...modalProps,
        });
    });
}

export const ModuleModals = ModuleFactory(createModule);
