import { XMLParser } from 'fast-xml-parser';
import { isNil } from 'lodash-es';
import assert from 'node:assert';
import { isArray } from 'node:util';

import type { TRiskSettings, TXmlRiskSettings } from '../../def';
import { mapXmlGroupToGroup } from './converters';

export const parseXML = (config: string): TXmlRiskSettings => {
    const res = new XMLParser({ ignoreAttributes: false }).parse(config);
    assert(!isNil(res), 'can not parse XML configuration file');
    // TODO: Validate config by TXmlRiskSettings type
    return res as TXmlRiskSettings;
};

export const parseXMLToRiskSettings = (config: string): TRiskSettings | undefined => {
    const data = parseXML(config);
    let group = data.execution_gate?.risk_management_limits?.group;
    if (isNil(group)) {
        return;
    }
    if (!isArray(group)) {
        group = [group];
    }

    return { group: group.map(mapXmlGroupToGroup) };
};
