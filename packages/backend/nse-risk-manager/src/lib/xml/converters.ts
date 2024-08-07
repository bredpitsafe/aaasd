import type { TRiskSettingsGroup, TXmlRiskSettingsGroup } from '../../def';

export const mapXmlGroupToGroup = (xmlGroup: TXmlRiskSettingsGroup): TRiskSettingsGroup => {
    const { '@_pattern': pattern, ...rest } = xmlGroup;
    return {
        pattern,
        ...rest,
    };
};
export const mapGroupToXmlGroup = (group: TRiskSettingsGroup): TXmlRiskSettingsGroup => {
    const { pattern, ...rest } = group;
    return {
        '@_pattern': pattern,
        ...rest,
    };
};
