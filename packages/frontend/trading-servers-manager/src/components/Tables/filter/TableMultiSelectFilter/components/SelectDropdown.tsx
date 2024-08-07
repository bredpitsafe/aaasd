import { CheckOutlined, ClearOutlined } from '@ant-design/icons';
import {
    ETableTabFilterProps,
    ETableTabFilterSelectors,
} from '@frontend/common/e2e/selectors/table-tab.filter.selectors';
import { Button, Divider, Space } from 'antd';
import type { ReactElement, ReactNode } from 'react';

import { cnSelectAllButton } from '../view.css';
import {
    cnApplyButton,
    cnButtonsBlock,
    cnCheckIcon,
    cnFooterDivider,
    cnHeaderDivider,
} from './style.css';

type TSelectDropdownProps = {
    originalNode: ReactNode;
    selectOrDeselectAll: () => void;
    checkedValuesLength: number;
    filteredOptionsLength: number;
    isAllFilteredOptionsChecked: boolean;
    handleApply: () => void;
    handleReset: () => void;
};

export const SelectDropdown = ({
    originalNode,
    selectOrDeselectAll,
    checkedValuesLength,
    filteredOptionsLength,
    isAllFilteredOptionsChecked,
    handleApply,
    handleReset,
}: TSelectDropdownProps): ReactElement => {
    return (
        <>
            <Button type="text" onClick={selectOrDeselectAll} className={cnSelectAllButton}>
                <span>
                    {isAllFilteredOptionsChecked
                        ? `Deselect All (${checkedValuesLength || 0})`
                        : `Select All (${filteredOptionsLength || 0})`}
                </span>
                {isAllFilteredOptionsChecked && <CheckOutlined className={cnCheckIcon} />}
            </Button>
            <Divider className={cnHeaderDivider} />
            {originalNode}
            <Divider className={cnFooterDivider} />
            <Space.Compact block className={cnButtonsBlock}>
                <Button
                    {...ETableTabFilterProps[ETableTabFilterSelectors.ApplyButton]}
                    type="primary"
                    onClick={handleApply}
                    className={cnApplyButton}
                >
                    Apply
                </Button>
                <Button
                    {...ETableTabFilterProps[ETableTabFilterSelectors.ResetButton]}
                    icon={<ClearOutlined />}
                    title="Reset filter"
                    onClick={handleReset}
                />
            </Space.Compact>
        </>
    );
};
