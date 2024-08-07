import {
    EWSQueryTerminalPageProps,
    EWSQueryTerminalSelectors,
} from '@frontend/common/e2e/selectors/ws-query-terminal/ws-query-terminal.page.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { Form } from '@frontend/common/src/components/Form';
import type { InputRef } from '@frontend/common/src/components/Input';
import { Input } from '@frontend/common/src/components/Input';
import { Modal } from '@frontend/common/src/components/Modals';
import { useModule } from '@frontend/common/src/di/react';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { memo, useRef, useState } from 'react';

import { ModuleRequest } from '../../modules/request';

export const RequestQuerySaver = memo((props: TWithClassname) => {
    const [form] = Form.useForm<{ name: string }>();
    const { saveRequestQuery } = useModule(ModuleRequest);
    const [open, setOpen] = useState(false);
    const inputRef = useRef<null | InputRef>(null);

    const showModal = () => {
        setOpen(true);
        setTimeout(() => inputRef.current?.focus());
    };

    const handleCancel = () => {
        form.resetFields();
        setOpen(false);
    };

    const handleOk = () => {
        form.validateFields().then((data) => {
            saveRequestQuery({ name: data.name });
            form.resetFields();
            setOpen(false);
        });
    };

    return (
        <>
            <Button
                {...EWSQueryTerminalPageProps[EWSQueryTerminalSelectors.SaveRequestButton]}
                className={props.className}
                type="primary"
                onClick={showModal}
            >
                Save
            </Button>
            <Modal open={open} title="Save Request Query" onOk={handleOk} onCancel={handleCancel}>
                <Form
                    form={form}
                    layout="vertical"
                    name="request-query-from"
                    initialValues={{ modifier: 'public' }}
                    onFinish={handleOk}
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please input the name for query!' }]}
                    >
                        <Input ref={inputRef} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
});
