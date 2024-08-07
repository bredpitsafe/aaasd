/* eslint-disable @typescript-eslint/no-unused-vars */

const { defaultUrl, version } = options;

const startIndicator = '{';
const endIndicator = '}';
const indicatorName = '[^' + endIndicator + ']+';
const escapeRegexp = '\\';
const nameRegexp = escapeRegexp + startIndicator + indicatorName + escapeRegexp + endIndicator;
const indicatorSplitterRegexp = '\\s*\\.\\s*';
const indicatorRegexp = '(?:' + nameRegexp + indicatorSplitterRegexp + ')?' + nameRegexp;

function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

function mergeDeep(sources) {
    if (!sources?.length) {
        return undefined;
    }

    const target = {};

    for (const source of sources) {
        if (source === null || source === undefined || !isObject(source)) {
            continue;
        }

        for (const key in source) {
            if (target[key] === null || target[key] === undefined) {
                Object.assign(target, { [key]: source[key] });
            } else if (isObject(target[key]) && isObject(source[key])) {
                target[key] = mergeDeep([target[key], source[key]]);
            } else if (Array.isArray(target[key]) && Array.isArray(source[key])) {
                const set = new Set(target[key]);
                source[key].forEach(set.add, set);
                target[key] = Array.from(set).sort();
            } else {
                target[key] = source[key];
            }
        }
    }

    return target;
}

function mergeParameters(sources) {
    if (!sources?.length) {
        return undefined;
    }

    const replaceOnlyFields = new Set(['text', 'column']);
    const target = {};

    for (const source of sources) {
        if (source === null || source === undefined || !isObject(source)) {
            continue;
        }

        for (const key in source) {
            if (replaceOnlyFields.has(key) || !isObject(target[key]) || !isObject(source[key])) {
                target[key] = source[key];
            } else {
                target[key] = mergeDeep([target[key], source[key]]);
            }
        }
    }

    return target;
}

function validateTemplateArgument(parameter) {
    return !!parameter && /^\s*\{[^}]+\s*$/.test(parameter);
}

function validateFormula(body, originalBody) {
    if (!body) {
        return;
    }

    try {
        new Function(body);
    } catch (error) {
        throw new Error(
            `Formula "${originalBody ?? body}" is incorrect, error: "${error.message}"`,
        );
    }
}

function validateScript(body) {
    if (!body) {
        return;
    }

    try {
        new Function(body)();
    } catch (error) {
        throw new Error(`Scope "${body}" is incorrect, error: "${error.message}"`);
    }
}

function validateTemplates(templates) {
    if (!templates || !templates.length) {
        return;
    }

    const names = new Set();

    for (let { name } of templates) {
        if (!name) {
            throw new Error('Template has empty name' + JSON.stringify(name));
        }

        if (names.has(name)) {
            throw new Error(`Templates has same name '${name}'`);
        }

        names.add(name);
    }
}

function isEmptyObject(object) {
    return (
        !!object &&
        Object.keys(object).length === 0 &&
        Object.getPrototypeOf(object) === Object.prototype
    );
}

function hasAgeProperty(text) {
    return /(^|\W)age\s*\(/.test(text);
}

function parseIndicator(name) {
    return [...name.matchAll(new RegExp(nameRegexp, 'g'))].map(([part]) =>
        part.replace(startIndicator, '').replace(endIndicator, '').trim(),
    );
}

function normalizedIndicatorName(parts) {
    return parts.map((part) => `{${part}}`).join('.');
}

function getFullBody(functionBody) {
    return /^return\s/.test(functionBody) ? functionBody : `return ${functionBody}`;
}

function normalizeFormula(formulaText) {
    return formulaText?.replaceAll(new RegExp(indicatorRegexp, 'g'), (indicatorCondition) =>
        normalizedIndicatorName(parseIndicator(indicatorCondition)),
    );
}

function parseFormula(formulaText) {
    const indicators = new Set();

    const original = normalizeFormula(formulaText);

    const functionBody = original
        .replaceAll(new RegExp(indicatorRegexp, 'g'), (indicatorCondition) => {
            const indicatorParts = parseIndicator(indicatorCondition);
            const indicatorName = normalizedIndicatorName(indicatorParts);

            indicators.add(indicatorName);

            return `getIndicatorValue(indicators, '${indicatorName}' + \`.{\${backtestingRunId ?? 0}}\`)`;
        })
        .trim();

    validateFormula(functionBody, original);

    if (indicators.size === 0) {
        throw new Error(`Formula '${original || functionBody}' doesn't contain indicator`);
    }

    return {
        original,
        functionBody: getFullBody(functionBody),
        indicators: Array.from(indicators).sort(),
        hasTimeout: hasAgeProperty(functionBody),
    };
}

function filterAndUnwrap(array, objectType) {
    return array?.filter(({ type }) => type === objectType)?.map(({ value }) => value);
}

function wrap(obj, objectType) {
    return { value: obj, type: objectType };
}

function identity(value) {
    return value;
}

function getCellIndicators(conditions, parameters) {
    const indicatorsSet = new Set();

    conditions.forEach(({ condition, parameters }) => {
        condition.indicators?.forEach(indicatorsSet.add, indicatorsSet);
        parameters?.text?.formula?.indicators?.forEach(indicatorsSet.add, indicatorsSet);
    });

    parameters?.text?.formula?.indicators?.forEach(indicatorsSet.add, indicatorsSet);

    return Array.from(indicatorsSet).sort();
}

function isTimerUpdatableCell(conditions, parameters) {
    return (
        (conditions?.some(({ condition: { hasTimeout = false } }) => hasTimeout) ?? false) ||
        (parameters?.text?.formula?.hasTimeout ?? false)
    );
}

function getTemplate(useTemplate, templates) {
    const template = templates?.find(
        ({ name }) => name.trim().toUpperCase() === useTemplate.name.trim().toUpperCase(),
    );

    if (!template) {
        throw new Error(`Template with name '${useTemplate.name.trim()}' is not found`);
    }

    if ((template.args?.length ?? 0) !== (useTemplate.args?.length ?? 0)) {
        throw new Error(
            `Template with name '${template.name.trim()}' has different number of parameters provided in use-template`,
        );
    }

    const replaceArgsMap = template.args.reduce(
        (acc, from, index) => ({
            ...acc,
            [from]: useTemplate.args[index],
        }),
        {},
    );

    function fixFormula(oldFormula) {
        return normalizeFormula(oldFormula).replace(
            new RegExp(indicatorRegexp, 'g'),
            function (from) {
                const to = replaceArgsMap[from];

                if (!to) {
                    return from;
                }

                return to;
            },
        );
    }

    const parameters = template.parameters ? { ...template.parameters } : undefined;

    if (parameters.text?.formula?.original) {
        parameters.text = {
            ...parameters.text,
            formula: parseFormula(fixFormula(parameters.text.formula.original)),
        };
    }

    const conditions =
        Array.isArray(template.conditions) && template.conditions.length > 0
            ? template.conditions
                  .map(({ condition, parameters }) => {
                      if (isEmptyObject(parameters)) {
                          return undefined;
                      }

                      const formula = parseFormula(fixFormula(condition.original));

                      return parameters.text?.formula?.original
                          ? {
                                condition: formula,
                                parameters: {
                                    ...parameters,
                                    text: {
                                        ...parameters.text,
                                        formula: parseFormula(
                                            fixFormula(parameters.text.formula.original),
                                        ),
                                    },
                                },
                            }
                          : { condition: formula, parameters };
                  })
                  .filter((identity) => identity)
            : undefined;

    const result = {};

    if (parameters) {
        Object.assign(result, { parameters });
    }
    if (conditions) {
        Object.assign(result, { conditions });
    }

    return isEmptyObject(result) ? undefined : result;
}

function applyCellTemplate(cell, templates) {
    if (!cell?.useTemplates?.length) {
        return cell;
    }

    const { useTemplates, ...rest } = cell;

    const cellTemplates = useTemplates
        .map((useTemplate) => getTemplate(useTemplate, templates))
        .filter((identity) => identity)
        .reduce(
            ({ parameters, conditions }, template) => ({
                parameters: mergeParameters([parameters, template.parameters]),
                conditions:
                    conditions && template.conditions
                        ? [...conditions, ...template.conditions]
                        : conditions ?? template.conditions,
            }),
            {},
        );

    const parameters = mergeParameters([cellTemplates.parameters, cell.parameters]);
    const conditions =
        cellTemplates.conditions && cell.conditions
            ? [...cellTemplates.conditions, ...cell.conditions]
            : cellTemplates.conditions ?? cell.conditions;

    const indicators = getCellIndicators(conditions, parameters);
    const hasTimeout = isTimerUpdatableCell(conditions, parameters);

    return {
        ...rest,
        parameters,
        conditions,
        indicators,
        hasTimeout,
    };
}

function applyCellsTemplate(cells, templates) {
    return cells?.map((cell) => applyCellTemplate(cell, templates));
}

function applyCellTemplateInRow(row, templates) {
    const cells = applyCellsTemplate(row.cells, templates);
    const rows =
        Array.isArray(row.rows) && row.rows.length
            ? applyCellTemplateInRows(row.rows, templates)
            : undefined;

    const allIndicatorsSet = new Set(row.allIndicators);

    cells?.forEach(({ indicators }) => indicators?.forEach(allIndicatorsSet.add, allIndicatorsSet));
    rows?.forEach(({ allIndicators }) =>
        allIndicators?.forEach(allIndicatorsSet.add, allIndicatorsSet),
    );

    const hasTimeout =
        row.hasTimeout ||
        (cells?.some(({ hasTimeout }) => hasTimeout) ?? false) ||
        (rows?.some(({ hasTimeout }) => hasTimeout) ?? false);

    return {
        ...row,
        allIndicators: Array.from(allIndicatorsSet).sort(),
        rows,
        cells,
        hasTimeout,
    };
}

function applyCellTemplateInRows(rows, templates) {
    return rows?.map((row) => applyCellTemplateInRow(row, templates));
}

function validateSources(indicators, urlSource) {
    for (const parts of indicators?.map((indicator) => parseIndicator(indicator)) ?? []) {
        if (parts.length < 2) {
            continue;
        }

        if (!(parts[0] in urlSource)) {
            throw new Error(
                `Source "${parts[0]}" is missing in registered sources. Source is case sensitive.`,
            );
        }
    }
}

function fixIndicatorNames(entity, urlSource) {
    if (!isObject(entity)) {
        return;
    }

    entity.rows?.forEach((row) => fixIndicatorNames(row, urlSource));
    entity.cells?.forEach((cell) => fixIndicatorNames(cell, urlSource));
    entity.conditions?.forEach((condition) => {
        fixIndicatorNames(condition, urlSource);
        fixIndicatorNames(condition?.condition, urlSource);
    });
    fixIndicatorNames(entity.parameters?.text?.formula, urlSource);

    const convertIndicator = (indicator) => {
        const parts = parseIndicator(indicator);

        if (parts.length === 1) {
            return { url: defaultUrl, name: parts[0] };
        }
        if (parts.length === 2) {
            return { url: urlSource[parts[0]], name: parts[1] };
        }
        throw new Error(`Wrong indicator name - "${indicator}"`);
    };

    entity.allIndicators = entity.allIndicators?.map(convertIndicator);
    entity.indicators = entity.indicators?.map(convertIndicator);
}

function fixFormulaIndicators(entity, urlSource) {
    if (!isObject(entity)) {
        return;
    }

    entity.rows?.forEach((row) => fixFormulaIndicators(row, urlSource));
    entity.cells?.forEach((cell) => fixFormulaIndicators(cell, urlSource));
    entity.conditions?.forEach((condition) => {
        fixFormulaIndicators(condition, urlSource);
        fixFormulaIndicators(condition?.condition, urlSource);
        fixFormulaIndicators(condition.parameters?.text?.formula, urlSource);
    });

    fixFormulaIndicators(entity.parameters?.text?.formula, urlSource);

    if ('functionBody' in entity) {
        const { functionBody } = entity;
        delete entity.functionBody;

        const bodyArgument = functionBody.replaceAll(
            new RegExp("'" + indicatorRegexp + "'", 'g'),
            (indicatorCondition) => {
                const parts = parseIndicator(indicatorCondition);

                if (parts.length === 2) {
                    parts[0] = urlSource[parts[0]];
                } else if (parts.length === 1) {
                    parts.unshift(defaultUrl);
                }

                return "'" + normalizedIndicatorName(parts) + "'";
            },
        );

        entity.constructorArguments = ['indicators', 'backtestingRunId', bodyArgument];
    }
}

function postProcessResultObject(entity, urlSource) {
    fixIndicatorNames(entity, urlSource);
    fixFormulaIndicators(entity, urlSource);

    return entity;
}

function processTableCellTemplate(template) {
    const [name] = filterAndUnwrap(template, 'name').slice(-1);

    if (!name) {
        throw new Error('Template name is mandatory');
    }

    const args = filterAndUnwrap(template, 'args')?.flat() ?? [];

    const parameters = mergeParameters(filterAndUnwrap(template, 'parameters')) ?? {};
    const conditions = filterAndUnwrap(template, 'conditions');

    return {
        name,
        args,
        parameters,
        conditions,
    };
}

function processTableCell(cell) {
    const parameters = mergeParameters(filterAndUnwrap(cell, 'parameters')) ?? {};
    const conditions = filterAndUnwrap(cell, 'conditions');
    const useTemplates = filterAndUnwrap(cell, 'templates');

    const indicators = getCellIndicators(conditions, parameters);
    const hasTimeout = isTimerUpdatableCell(conditions, parameters);

    return {
        parameters,
        conditions,
        indicators,
        hasTimeout,
        useTemplates,
    };
}

function processTableRow(row) {
    const parameters = mergeParameters(filterAndUnwrap(row, 'parameters')) ?? {};
    const conditions = filterAndUnwrap(row, 'conditions');
    const cells = filterAndUnwrap(row, 'cells');
    const rows = filterAndUnwrap(row, 'rows');

    const indicatorsSet = new Set();
    conditions.forEach(({ condition }) =>
        condition.indicators?.forEach(indicatorsSet.add, indicatorsSet),
    );

    const indicators = Array.from(indicatorsSet).sort();

    const allIndicatorsSet = new Set(indicatorsSet);
    cells?.forEach(({ indicators }) => indicators?.forEach(allIndicatorsSet.add, allIndicatorsSet));
    rows?.forEach(({ allIndicators }) =>
        allIndicators?.forEach(allIndicatorsSet.add, allIndicatorsSet),
    );

    const allIndicators = Array.from(allIndicatorsSet).sort();

    const hasTimeout =
        (cells?.some(({ hasTimeout }) => hasTimeout) ?? false) ||
        (rows?.some(({ hasTimeout }) => hasTimeout) ?? false) ||
        (conditions?.some(({ condition: { hasTimeout = false } }) => hasTimeout) ?? false);

    const rowsCells = rows?.reduce((max, row) => Math.max(max, row.columnsCount ?? 0), 0);
    const columnsCount = Math.max(rowsCells > 0 ? rowsCells + 1 : 0, cells.length);

    if (rows?.length > 0) {
        return {
            rowsCells: rowsCells > 0 ? rowsCells + 1 : 0,
            allIndicators,
            indicators,
            parameters,
            conditions,
            rows,
            cells,
            hasTimeout,
            columnsCount,
        };
    }

    return {
        allIndicators,
        indicators,
        parameters,
        conditions,
        cells,
        hasTimeout,
        columnsCount,
    };
}

function processTableContent(table) {
    const parameters = mergeParameters(filterAndUnwrap(table, 'parameters'));
    const conditions = filterAndUnwrap(table, 'conditions');
    const rawRows = filterAndUnwrap(table, 'rows');
    const scope =
        filterAndUnwrap(table, 'scope')
            ?.filter((scope) => scope)
            ?.join('') || undefined;
    const templates = filterAndUnwrap(table, 'templates') ?? [];
    const urlSource =
        filterAndUnwrap(table, 'sources')?.reduce((acc, { name, url }) => {
            if (name in acc) {
                throw new Error(`Multiple sources with same name '${name}'`);
            }

            acc[name] = url;

            return acc;
        }, {}) ?? {};

    const rows = applyCellTemplateInRows(rawRows, templates);

    validateTemplates(templates);

    const indicatorsSet = new Set();
    conditions?.forEach(({ condition: { indicators } }) =>
        indicators?.forEach(indicatorsSet.add, indicatorsSet),
    );

    const indicators = Array.from(indicatorsSet).sort();

    const allIndicatorsSet = new Set(indicatorsSet);
    rows?.forEach(({ allIndicators }) =>
        allIndicators?.forEach(allIndicatorsSet.add, allIndicatorsSet),
    );

    const allIndicators = Array.from(allIndicatorsSet).sort();

    const hasTimeout =
        (rows?.some(({ hasTimeout }) => hasTimeout) ?? false) ||
        (conditions?.some(({ condition: { hasTimeout = false } }) => hasTimeout) ?? false);

    const maxRowColumnsCount = rows?.reduce((max, row) => Math.max(max, row.columnsCount), 0) ?? 0;

    validateSources(allIndicators, urlSource);

    return postProcessResultObject(
        {
            allIndicators,
            indicators,
            parameters: { ...parameters, maxRowColumnsCount },
            conditions,
            rows,
            hasTimeout,
            scope,
            version,
        },
        urlSource,
    );
}

function processGridCellTemplate(template) {
    const [name] = filterAndUnwrap(template, 'name').slice(-1);

    if (!name) {
        throw new Error('Template name is mandatory');
    }

    const args = filterAndUnwrap(template, 'args')?.flat() ?? [];

    const parameters = mergeParameters(filterAndUnwrap(template, 'parameters')) ?? {};
    const conditions = filterAndUnwrap(template, 'conditions');

    return {
        name,
        args,
        parameters,
        conditions,
    };
}

function processGridCell(cell) {
    const parameters = mergeParameters(filterAndUnwrap(cell, 'parameters')) ?? {};
    const conditions = filterAndUnwrap(cell, 'conditions');
    const useTemplates = filterAndUnwrap(cell, 'templates');

    const indicators = getCellIndicators(conditions, parameters);
    const hasTimeout = isTimerUpdatableCell(conditions, parameters);

    return {
        parameters,
        conditions,
        indicators,
        hasTimeout,
        useTemplates,
    };
}

function processGridContent(grid) {
    const parameters = mergeParameters(filterAndUnwrap(grid, 'parameters'));
    const conditions = filterAndUnwrap(grid, 'conditions');
    const rawCells = filterAndUnwrap(grid, 'cells');
    const scope =
        filterAndUnwrap(grid, 'scope')
            ?.filter((scope) => scope)
            ?.join('') || undefined;
    const templates = filterAndUnwrap(grid, 'templates') ?? [];
    const urlSource =
        filterAndUnwrap(grid, 'sources')?.reduce((acc, { name, url }) => {
            if (name in acc) {
                throw new Error(`Multiple sources with same name '${name}'`);
            }

            acc[name] = url;

            return acc;
        }, {}) ?? {};

    const cells = applyCellsTemplate(rawCells, templates);

    validateTemplates(templates);

    const indicatorsSet = new Set();
    conditions.forEach(({ condition: { indicators } }) =>
        indicators?.forEach(indicatorsSet.add, indicatorsSet),
    );

    const indicators = Array.from(indicatorsSet).sort();

    const allIndicatorsSet = new Set(indicatorsSet);
    cells.forEach(({ indicators }) => indicators?.forEach(allIndicatorsSet.add, allIndicatorsSet));

    const allIndicators = Array.from(allIndicatorsSet).sort();

    const columnsCount =
        parameters?.columnsCount ??
        Math.max(
            ...(cells
                ?.filter(({ parameters }) => parameters?.column !== undefined)
                ?.map(({ parameters }) => parameters.column) || []),
            1,
        );

    const hasTimeout =
        conditions?.some(({ condition: { hasTimeout = false } }) => hasTimeout) ?? false;

    validateSources(allIndicators, urlSource);

    return postProcessResultObject(
        {
            allIndicators,
            indicators,
            parameters: { ...parameters, columnsCount },
            conditions,
            cells: cells?.map((cell) => applyCellTemplate(cell, templates)),
            scope,
            hasTimeout,
            version,
        },
        urlSource,
    );
}

function processGridColumnsCount(text) {
    const count = parseInt(text, 10);
    return { columnsCount: isNaN(count) ? undefined : count };
}

function processGridColumn(text) {
    if (!text?.trim()) {
        return { column: undefined };
    }

    const value = parseInt(text, 10);

    if (isNaN(value)) {
        return { column: undefined };
    }

    return { column: value };
}

function processMark(parameters) {
    return { mark: mergeDeep(parameters) ?? {} };
}

function processFormula(formula) {
    return { formula: formula ? parseFormula(formula) : undefined };
}

function processFormat(format) {
    return { format: format || undefined };
}

function processFormattedText(parameters) {
    const { format = undefined, formula = undefined } = mergeDeep(parameters);
    return { format, formula };
}

function processDisplayValue(value) {
    if (value === null || value === undefined) {
        return { text: undefined };
    }

    return { text: value };
}

function processTooltip(tooltip) {
    return { tooltip: tooltip || undefined };
}

function processEmptyStyleItem(startTag) {
    const styleName = startTag.replace(/[\W|_]+(\w)/g, (_, firstGroupLetter) =>
        firstGroupLetter.toUpperCase(),
    );

    return { [styleName]: null };
}

// Lodash realization of kebabCase
const rsAstralRange = '\\ud800-\\udfff';
const rsComboMarksRange = '\\u0300-\\u036f';
const reComboHalfMarksRange = '\\ufe20-\\ufe2f';
const rsComboSymbolsRange = '\\u20d0-\\u20ff';
const rsComboMarksExtendedRange = '\\u1ab0-\\u1aff';
const rsComboMarksSupplementRange = '\\u1dc0-\\u1dff';
const rsComboRange =
    rsComboMarksRange +
    reComboHalfMarksRange +
    rsComboSymbolsRange +
    rsComboMarksExtendedRange +
    rsComboMarksSupplementRange;
const rsDingbatRange = '\\u2700-\\u27bf';
const rsLowerRange = 'a-z\\xdf-\\xf6\\xf8-\\xff';
const rsMathOpRange = '\\xac\\xb1\\xd7\\xf7';
const rsNonCharRange = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf';
const rsPunctuationRange = '\\u2000-\\u206f';
const rsSpaceRange =
    ' \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000';
const rsUpperRange = 'A-Z\\xc0-\\xd6\\xd8-\\xde';
const rsVarRange = '\\ufe0e\\ufe0f';
const rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;

const rsApos = "['\u2019]";
const rsBreak = `[${rsBreakRange}]`;
const rsCombo = `[${rsComboRange}]`;
const rsDigit = '\\d';
const rsDingbat = `[${rsDingbatRange}]`;
const rsLower = `[${rsLowerRange}]`;
const rsMisc = `[^${rsAstralRange}${
    rsBreakRange + rsDigit + rsDingbatRange + rsLowerRange + rsUpperRange
}]`;
const rsFitz = '\\ud83c[\\udffb-\\udfff]';
const rsModifier = `(?:${rsCombo}|${rsFitz})`;
const rsNonAstral = `[^${rsAstralRange}]`;
const rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
const rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
const rsUpper = `[${rsUpperRange}]`;
const rsZWJ = '\\u200d';

const rsMiscLower = `(?:${rsLower}|${rsMisc})`;
const rsMiscUpper = `(?:${rsUpper}|${rsMisc})`;
const rsOptContrLower = `(?:${rsApos}(?:d|ll|m|re|s|t|ve))?`;
const rsOptContrUpper = `(?:${rsApos}(?:D|LL|M|RE|S|T|VE))?`;
const reOptMod = `${rsModifier}?`;
const rsOptVar = `[${rsVarRange}]?`;
const rsOptJoin = `(?:${rsZWJ}(?:${[rsNonAstral, rsRegional, rsSurrPair].join('|')})${
    rsOptVar + reOptMod
})*`;
const rsOrdLower = '\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])';
const rsOrdUpper = '\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])';
const rsSeq = rsOptVar + reOptMod + rsOptJoin;
const rsEmoji = `(?:${[rsDingbat, rsRegional, rsSurrPair].join('|')})${rsSeq}`;

const reUnicodeWords = RegExp(
    [
        `${rsUpper}?${rsLower}+${rsOptContrLower}(?=${[rsBreak, rsUpper, '$'].join('|')})`,
        `${rsMiscUpper}+${rsOptContrUpper}(?=${[rsBreak, rsUpper + rsMiscLower, '$'].join('|')})`,
        `${rsUpper}?${rsMiscLower}+${rsOptContrLower}`,
        `${rsUpper}+${rsOptContrUpper}`,
        rsOrdUpper,
        rsOrdLower,
        `${rsDigit}+`,
        rsEmoji,
    ].join('|'),
    'g',
);

function unicodeWords(str) {
    return str.match(reUnicodeWords);
}

const hasUnicodeWord = RegExp.prototype.test.bind(
    /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/,
);

const reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;

function asciiWords(string) {
    return string.match(reAsciiWord);
}

function words(string, pattern) {
    if (pattern === undefined) {
        const result = hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
        return result || [];
    }
    return string.match(pattern) || [];
}

function kebabCase(str) {
    return words(str)
        .map((word) => word.toLowerCase())
        .join('-');
}

function processStyleItem(startTag, content, endTag) {
    if (startTag !== endTag) {
        throw new Error(`Start tag "${startTag}" doesn't match end tag "${endTag}"`);
    }

    const styleName = startTag.replace(/[\W|_]+(\w)/g, (_, firstGroupLetter) =>
        firstGroupLetter.toUpperCase(),
    );

    const styleValue = content?.trim() || null;

    if (styleValue === null) {
        return { [styleName]: null };
    }

    const browserCssPropertyName = kebabCase(styleName);

    if (!CSS.supports(browserCssPropertyName, styleValue)) {
        throw new Error(
            `Not supported value of the CSS property "${styleValue}" for CSS property "${browserCssPropertyName}"`,
        );
    }

    return { [styleName]: styleValue };
}

function processStyle(styles) {
    return {
        style: styles.reduce((acc, style) => ({ ...acc, ...style }), {}),
    };
}

function processScriptScope(scope) {
    validateScript(scope);

    return scope?.trim() || undefined;
}

function processConditionExpression(condition) {
    return parseFormula(condition);
}

function processTemplateArgument(argument, maxParts = 2) {
    validateTemplateArgument(argument);

    const parts = parseIndicator(argument);

    if (parts.length > maxParts) {
        throw new Error(`Name shouldn't have more than ${maxParts} parts: '${argument}'`);
    }

    return normalizedIndicatorName(parts);
}

function processTemplateArguments(args) {
    return (args ?? []).filter(identity);
}

function processRequiredValue(name, objectName) {
    if (!name?.trim()) {
        throw new Error(`${objectName} can't be empty`);
    }
    return name.trim();
}

function processTemplateUseContent(name, args) {
    return { name, args };
}

function processSource(name, url) {
    return { name, url };
}
