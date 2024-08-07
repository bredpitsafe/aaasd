export type TRiskSettingsGroup = {
    pattern: string;
    cumulative_open_order: number;
    position: number;
    turnover: number;
    exposure: number;
    exposure_limit_leverage: number;
};

export type TRiskSettings = {
    group: TRiskSettingsGroup[] | undefined;
};

export type TXmlRiskSettingsGroup = Omit<TRiskSettingsGroup, 'pattern'> & {
    '@_pattern': string;
};

export type TXmlRiskSettings = {
    execution_gate?: {
        risk_management_limits?: {
            group?: TXmlRiskSettingsGroup | TXmlRiskSettingsGroup[];
        };
    };
};
