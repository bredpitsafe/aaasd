import { buildShader, glsl } from '../../src/components/utils/shaders/buildShader';
import { HAS_BROKEN_VERTEX_ID } from '../../src/utils/detect';

export const fragment = buildShader({
    // language=GLSL
    body: glsl`
        in vec4 fragValue;
        out vec4 fragColor;

        void main() {
            fragColor = fragValue;
        }
    `,
});

export const vertex = buildShader({
    uniforms: {
        uResolution: 'vec2',
        uStartPosition: 'vec2',
    },
    attributes: {
        aVertexID: 'float',
        aValues: 'vec4',
    },
    // language=GLSL
    body: glsl`
        out vec4 fragValue;

        void main() {
            float absVertexIndex = ${HAS_BROKEN_VERTEX_ID ? 'aVertexID' : ' float(gl_VertexID)'};
            
            fragValue = aValues;
            gl_PointSize = 1.;
            gl_Position = vec4(
                2.0 * (uStartPosition.x + 0.5 + absVertexIndex) / uResolution.x - 1.0,
                2.0 * (uStartPosition.y + 0.5) / uResolution.y - 1.0,
                0.0,
                1.0
            );
        }
    `,
});
