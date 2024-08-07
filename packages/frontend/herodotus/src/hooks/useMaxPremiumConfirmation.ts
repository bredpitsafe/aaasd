import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { sprintf } from '@frontend/common/src/utils/sprintf/sprintf';
import { isNil } from 'lodash-es';

type TValidateMaxPremium = (maxPremium: number) => Promise<boolean>;
const maxPremiumFormat = '%g%%';
const MAX_PREMIUM_ABS_WARN_LEVEL = 5;

export function useMaxPremiumConfirmation(): TValidateMaxPremium {
    const { confirm } = useModule(ModuleModals);

    return useFunction(async (maxPremium): Promise<boolean> => {
        if (!requestMaxPremiumConfirmation(maxPremium)) {
            return true;
        }

        return Math.sign(maxPremium) === -1
            ? confirm(
                  `Max Premium is ${sprintf(
                      maxPremiumFormat,
                      maxPremium,
                  )} which is below warn level ${sprintf(
                      maxPremiumFormat,
                      -MAX_PREMIUM_ABS_WARN_LEVEL,
                  )}, are you sure?`,
              )
            : confirm(
                  `Max Premium is ${sprintf(
                      maxPremiumFormat,
                      maxPremium,
                  )} which is over warn level ${sprintf(
                      maxPremiumFormat,
                      MAX_PREMIUM_ABS_WARN_LEVEL,
                  )}, are you sure?`,
              );
    });
}

function requestMaxPremiumConfirmation(maxPremium?: number): boolean {
    return !isNil(maxPremium) && Math.abs(maxPremium) > MAX_PREMIUM_ABS_WARN_LEVEL;
}
