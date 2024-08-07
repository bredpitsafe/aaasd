import { NAN_WEBGL_VALUE } from '../../../utils/WebGLNaN';
import { funcGLSL, glsl } from './buildShader';

export const isValueNaN = funcGLSL(() => (name: string) => {
    // language=GLSL
    return glsl`
        bool ${name}(float val) {
          return val == ${NAN_WEBGL_VALUE};
        }
    `;
});

export const prepareSecondPoint = funcGLSL(() => (name: string) => {
    // language=GLSL
    return glsl`
        vec2 ${name}(vec2 pointA, vec2 pointB, float minTimeToPixel) {
            // draw forward line if raw point b is nan
            if (${isValueNaN()}(pointB.y) && !${isValueNaN()}(pointA.y)) {
                pointB.y = pointA.y;
                pointB.x = max(pointB.x, pointA.x + minTimeToPixel);
            }
            
            return pointB;
        }
    `;
});

export const getRectBasis = funcGLSL(
    () => (name: string) => {
        // language=GLSL
        return glsl`
        const vec2[6] rectVertexBasis = vec2[6](
            vec2(0.0, 1.0), // 0
            vec2(1.0, 1.0), // 1
            vec2(0.0, 0.0), // 2
            vec2(1.0, 1.0), // 3
            vec2(0.0, 0.0), // 4
            vec2(1.0, 0.0)  // 5
        );

        vec2 ${name}(int vertexIndex) {
            return rectVertexBasis[vertexIndex];
        }
    `;
    },
    'getRectSide',
);

export const computeRectVertexPosition = funcGLSL(
    () => (name: string) => {
        // language=GLSL
        return glsl`
        vec2 ${name}(vec2[2] points, vec2 basis, vec2 width) {
            // what happen here - https://wwwtyro.net/2019/11/18/instanced-lines.html
            vec2 xBasis = points[1] - points[0];
            vec2 yBasis = width * normalize(vec2(-xBasis.y, xBasis.x));

            return points[0] + xBasis * basis.x + yBasis * (basis.y - 0.5);
        }
    `;
    },
    'computeRectVertexPosition',
);

export const ROUND_JOINS_VERTEXES = 6;
export const getRoundJoinsBasis = funcGLSL(
    () => (name: string) => {
        // language=GLSL
        return glsl`
        const vec2[${ROUND_JOINS_VERTEXES}] joinBasis = vec2[${ROUND_JOINS_VERTEXES}](
            vec2(0, 1),
            vec2(1, 1),
            vec2(0, 0),
            vec2(0, 0),
            vec2(1, 1),
            vec2(1, 0)
        );

        vec2 ${name}(int vertexIndex) {
            return joinBasis[vertexIndex] - vec2(0.5);
        }
    `;
    },
    'getRoundJoinsBasis',
);

export const computeRoundJoinsVertexPosition = funcGLSL(
    () => (name: string) => {
        // language=GLSL
        return glsl`
        vec2 ${name}(vec2 point, vec2 shift) {
            return point + shift;
        }
    `;
    },
    'computeRoundJoinsVertexPosition',
);

export const computePointVertexPosition = funcGLSL(
    () => (name: string) => {
        // language=GLSL
        return glsl`
        vec2 ${name}(int vertexIndex, vec2 point, vec2 width) {
            // 1 triangle
            if (vertexIndex == 0) point -= vec2(-width.x/2., -width.y/2.);
            if (vertexIndex == 1) point -= vec2( width.x/2., -width.y/2.);
            if (vertexIndex == 2) point -= vec2(-width.x/2.,  width.y/2.);

            // 2 triangle
            if (vertexIndex == 3) point -= vec2(-width.x/2.,  width.y/2.);
            if (vertexIndex == 4) point -= vec2( width.x/2., -width.y/2.);
            if (vertexIndex == 5) point -= vec2( width.x/2.,  width.y/2.);

            return point;
        }
    `;
    },
    'computePointVertexPosition',
);

export const computeTrapezeVertexPosition = funcGLSL(() => (name: string) => {
    // language=GLSL
    return glsl`
        vec2 ${name}(int vertexIndex, vec2[2] points) {
            vec2 point;
            // 1 triangle
            if (vertexIndex == 0) point = points[0];
            if (vertexIndex == 1) point = points[1];
            if (vertexIndex == 2) point = vec2(points[0].x, -1.0);

            // 2 triangle
            if (vertexIndex == 3) point = points[1];
            if (vertexIndex == 4) point = vec2(points[0].x, -1.0);
            if (vertexIndex == 5) point = vec2(points[1].x, -1.0);

            return point;
        }
    `;
});
