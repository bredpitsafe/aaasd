import { getRandomUint32 } from '@frontend/common/src/utils/random';
import { isEmpty, uniq, uniqBy } from 'lodash-es';

type TGLSLModule = TGLSLPart | TGLSLFunc;

type TGLSLPart = {
    deps: TGLSLModule[];
    body: string;
};

type TGLSLFunc = {
    deps: TGLSLModule[];
    name: string;
    body: string;
};

type TShaderData = {
    uniforms?: Record<string, string>;
    attributes?: Record<string, string>;
    header?: string[];
    body: TGLSLModule;
};

// language=GLSL
const DEFAULT_HEADER = [
    `
    #version 300 es
    precision highp float;
    `,
];

function isGLSLFunc(module: TGLSLModule): module is TGLSLFunc {
    return 'name' in module && !isEmpty(module.name);
}

function isGLSLPart(module: TGLSLModule): module is TGLSLPart {
    return !('name' in module) || isEmpty(module.name);
}

function getSortedDependencies(dependencies: TGLSLModule[]): TGLSLModule[] {
    const partDeps = uniqBy(dependencies.filter(isGLSLPart), ({ body }) => body);
    const unsortedDeps = uniqBy(dependencies.filter(isGLSLFunc), ({ name }) => name);
    const sortedDeps: TGLSLFunc[] = [];

    if (unsortedDeps.length > 0) {
        const processedDeps = new Set<string>();

        while (unsortedDeps.length > processedDeps.size) {
            const currentLength = processedDeps.size;

            for (const dependency of unsortedDeps) {
                if (processedDeps.has(dependency.name)) {
                    continue;
                }

                const namedDeps = dependency.deps.filter(isGLSLFunc).map(({ name }) => name);

                if (namedDeps.length === 0 || namedDeps.every((name) => processedDeps.has(name))) {
                    processedDeps.add(dependency.name);
                    sortedDeps.push(dependency);
                }
            }

            if (currentLength === processedDeps.size) {
                throw new Error(`Can't resolve dependencies`);
            }
        }
    }

    return [...partDeps, ...sortedDeps];
}

export function buildShader<Data extends TShaderData>(
    data: Data,
): {
    uniforms: { [P in keyof Data['uniforms']]: P };
    attributes: { [P in keyof Data['attributes']]: P };
    shader: string;
    toString(withLines?: boolean): string;
} {
    const { uniforms, attributes } = data;
    const uniformKeys = uniforms ? Object.keys(uniforms) : [];
    const uniformsPart = uniformKeys.reduce((acc, key) => {
        return `
            ${acc}
            uniform ${uniforms![key]} ${key};
        `;
    }, '');

    const attributesKeys = attributes ? Object.keys(attributes) : [];
    const attributesPart = attributesKeys.reduce((acc, key) => {
        return `
            ${acc}
            in ${attributes![key]} ${key};
        `;
    }, '');

    const body =
        getSortedDependencies(data.body.deps)
            .map((item) => item.body)
            .join('') + data.body.body;

    const shader = `
        ${uniq(data.header || DEFAULT_HEADER).join('')}
        ${uniformsPart}
        ${attributesPart}
        ${body}
    `;

    return {
        uniforms: (uniformKeys as (keyof Data['uniforms'])[]).reduce(
            (acc, name) => ((acc[name] = name), acc),
            {} as { [P in keyof Data['uniforms']]: P },
        ),
        attributes: (attributesKeys as (keyof Data['attributes'])[]).reduce(
            (acc, name) => ((acc[name] = name), acc),
            {} as { [P in keyof Data['attributes']]: P },
        ),
        shader: shader,
        toString: (withLineNumbers = false): string => {
            const code = shader.trim();

            return !withLineNumbers
                ? code
                : code
                      .split('\n')
                      .map((line, i) => `${i + 1}: ${line}`)
                      .join('\n');
        },
    };
}

export function glsl(
    strings: TemplateStringsArray,
    ...values: (number | string | TGLSLModule)[]
): TGLSLModule {
    const deps: TGLSLModule[] = [];
    const body = strings.reduce((acc, str, i) => {
        const value = values[i];
        let valueStr = '';

        if (value === undefined || typeof value === 'string' || typeof value === 'number') {
            valueStr = value ? String(value) : '';
        }

        if (typeof value === 'object') {
            if ('name' in value) {
                valueStr = 'name' in value ? value.name : '';
                deps.push(value);
            } else {
                valueStr = value.body ?? '';
            }

            deps.push(...value.deps);
        }

        return acc + str + valueStr;
    }, '');

    return {
        deps: uniq(deps),
        body,
    };
}

const getNextName = () => {
    return 'funcName_' + getRandomUint32();
};

export function funcGLSL<Dep extends TGLSLModule, Deps extends Dep[]>(
    fn: (...deps: Deps) => (name: string) => TGLSLModule,
    name: string = getNextName(),
): (...deps: Deps) => TGLSLModule {
    return (...deps: Deps): TGLSLModule => {
        return {
            ...fn(...deps)(name),
            name,
        };
    };
}
