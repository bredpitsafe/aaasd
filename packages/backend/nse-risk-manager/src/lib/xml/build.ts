import { XMLBuilder } from 'fast-xml-parser';

export const buildXML = (config: object): string => {
    const builder = new XMLBuilder({
        format: true,
        ignoreAttributes: false,
        suppressBooleanAttributes: false,
        suppressEmptyNode: false,
    });
    return builder.build(config);
};
