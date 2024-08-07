import { FileAddOutlined } from '@ant-design/icons';
import { isArray, isEmpty, isObject, isString } from 'lodash-es';
import { useMemo, useState } from 'react';

import type { TTextFile } from '../../types/domain/textFile';
import { useFunction } from '../../utils/React/useFunction';
import { Card } from '../Card';
import { Editor } from '../Editors/Editor';
import { getLanguage } from '../Editors/utils';
import { Empty } from '../Empty';
import { Modal } from '../Modals';
import { Result } from '../Result';
import type { RcFile, UploadFile } from '../Upload';
import { Upload } from '../Upload';
import { cnEditor, cnModal } from './style.css';

type TProps = {
    value?: TTextFile[];
    onChange: (files: TTextFile[]) => void;
    readonly?: boolean;
};

export const FilesManager = ({ value, onChange, readonly }: TProps) => {
    const [previewContent, setPreviewContent] = useState<TTextFile | null>(null);

    const elementsToShow = useMemo(
        () => ({
            showRemoveIcon: !readonly,
        }),
        [readonly],
    );

    const fileList = useMemo(
        () =>
            isArray(value)
                ? value.map(({ name, content }, i) => ({
                      uid: String(-1 - i),
                      name,
                      content,
                  }))
                : [],
        [value],
    );

    const addFileToList = useFunction((file: RcFile) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
            const newFile = {
                name: file.name,
                content: isString(reader.result) ? reader.result : '',
            };
            onChange(isArray(value) ? value.concat(newFile) : [newFile]);
        };
        return false;
    });

    const removeFileFromList = useFunction((file: UploadFile<unknown>) => {
        onChange(
            fileList
                .filter(({ uid }) => uid !== file.uid)
                .map(({ name, content }) => ({
                    name,
                    content,
                })),
        );
    });

    const showPreview = useFunction((file: UploadFile<unknown>) => {
        setPreviewContent(fileList.find(({ uid }) => uid === file.uid) ?? null);
    });

    const closePreview = useFunction(() => setPreviewContent(null));

    if (isEmpty(fileList) && readonly) {
        return <Empty description="No attachments" />;
    }

    const previewBody = previewContent?.content;

    return (
        <>
            <Upload
                beforeUpload={addFileToList}
                fileList={fileList}
                listType="text"
                onRemove={removeFileFromList}
                onPreview={showPreview}
                multiple
                disabled={readonly}
                showUploadList={elementsToShow}
            >
                {readonly ? null : (
                    <Card>
                        <Result
                            icon={<FileAddOutlined />}
                            title="Attach files"
                            subTitle="Click in this area or drag and drop files to attach"
                        />
                    </Card>
                )}
            </Upload>
            <Modal
                className={cnModal}
                title={previewContent?.name}
                open={isObject(previewContent)}
                onCancel={closePreview}
                footer={null}
                width={980}
            >
                {isString(previewBody) ? (
                    <Editor
                        className={cnEditor}
                        value={previewBody}
                        language={getLanguage(previewBody)}
                    />
                ) : null}
            </Modal>
        </>
    );
};
