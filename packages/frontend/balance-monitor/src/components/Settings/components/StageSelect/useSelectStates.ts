import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useState } from 'react';

export function useSelectStates(): {
    isActive: boolean;
    handleHover: VoidFunction;
    handleUnHover: VoidFunction;
    handleFocus: VoidFunction;
    handleBlur: VoidFunction;
    handleSetOpenedState: (opened: boolean) => void;
} {
    const [isOpen, handleSetOpenedState] = useState<boolean>(false);
    const [isHover, setIsHover] = useState<boolean>(false);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const isActive = isHover || isOpen || isFocused;

    const handleHover = useFunction(() => setIsHover(true));
    const handleUnHover = useFunction(() => setIsHover(false));
    const handleFocus = useFunction(() => setIsFocused(true));
    const handleBlur = useFunction(() => setIsFocused(false));

    return { isActive, handleHover, handleUnHover, handleFocus, handleBlur, handleSetOpenedState };
}
