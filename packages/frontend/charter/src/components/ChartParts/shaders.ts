import { Shader } from 'pixi.js';

import { HAS_BROKEN_VERTEX_ID, MAX_VERTEX_UNIFORM_VECTORS } from '../../utils/detect';
import { glslUnpackRGBA } from '../../utils/unpackRGBA';
import { buildShader, funcGLSL, glsl } from '../utils/shaders/buildShader';
import {
    computePointVertexPosition,
    computeRectVertexPosition,
    computeRoundJoinsVertexPosition,
    computeTrapezeVertexPosition,
    getRectBasis,
    getRoundJoinsBasis,
    isValueNaN,
    prepareSecondPoint,
} from '../utils/shaders/computePositions';
import { MAX_CUMULATIVE_SUM } from './def';

const getVertexIndex = funcGLSL(() => (name) => {
    // language=GLSL
    return glsl`
        int ${name}(float absVertexIndex) {
            // Be careful when updating following line, on some video cards mod function is buggy when using two variables
            // https://stackoverflow.com/questions/16701342/glsl330-modulo-returns-unexpected-value
            return int(absVertexIndex) % uInstanceSize;
        }
    `;
});
const getPointIndex = funcGLSL(() => (name) => {
    // language=GLSL
    return glsl`
        float ${name}(float absVertexIndex) {
            // Be careful when updating following line, on some video cards division is buggy
            return float(int(absVertexIndex) / uInstanceSize);
        }
    `;
});

const getPartIndex = funcGLSL(() => (name) => {
    // language=GLSL

    return glsl`
        int ${name}(float absVisIndex) {
            int partIndex = 0;
            while (absVisIndex >= uPartsSizeCumulativeSum[partIndex]) {
                partIndex += 1;
            }
            
            return partIndex;
        }
    `;
});

const isLastPoint = funcGLSL(() => (name) => {
    // language=GLSL
    return glsl`
        bool ${name}(int partIndex, float absVisIndex) {
            return uPartsSizeCumulativeSum[partIndex] - absVisIndex == 1.;
        }
    `;
});

const isRightestPart = funcGLSL(() => (name) => {
    // language=GLSL
    return glsl`
        bool ${name}(int partIndex) {
            return uPartsSizeCumulativeSum[partIndex] == float(${MAX_CUMULATIVE_SUM});
        }
    `;
});

const isLastPart = funcGLSL(() => (name) => {
    // language=GLSL
    return glsl`
        bool ${name}(int partIndex) {
            return uPartsSizeCumulativeSum[partIndex + 1] == float(${MAX_CUMULATIVE_SUM});
        }
    `;
});

const getPartPointIndex = funcGLSL(() => (name) => {
    // language=GLSL
    return glsl`
        float ${name}(int partIndex, float absVisIndex) {
            return absVisIndex - (partIndex == 0 ? 0. : uPartsSizeCumulativeSum[partIndex - 1]);
        }
    `;
});

const getPoint = funcGLSL(() => (name) => {
    // language=GLSL
    return glsl`
        // For stairs each second visual point consists from 2 real points (left and right)
        vec4 ${name}(float absVisIndex) {
            bool isStairs = uType == 2./*Stairs*/;
            int partIndex = ${getPartIndex()}(absVisIndex);
            float partPointIndex = ${getPartPointIndex()}(partIndex, absVisIndex);
            
            bool isFirstPoint = partPointIndex == 0.;
            bool isLeftestPart = partIndex == 0;
      
            if (isFirstPoint && isLeftestPart) {
                return uLeftestPoint;
            }
            
            bool isRightestPart = ${isRightestPart()}(partIndex);
            
            if (isFirstPoint && isRightestPart) {
                return uRightestPoint;
            }

            float texColOffsetY = 0.;

            if (isStairs) {
                texColOffsetY = -mod(partPointIndex, 2.);
                partPointIndex = ceil(partPointIndex / 2.);
            }

            bool isLastPoint = ${isLastPoint()}(partIndex, absVisIndex);
            vec2 offset = uPartsOffset[partIndex];
            vec2 storeXY = uPartsStoreCoord[partIndex];
            
            float x;
            float y;
            float color;
            float width;

            if (isStairs && isLastPoint && isLeftestPart) {
                y = uLeftestPoint.y;
            } else {
                float texColY = floor(partPointIndex + texColOffsetY);
                float yRelative = texelFetch(uPartsStore, ivec2(storeXY.x + texColY, storeXY.y), 0)[1];
                
                y = ${isValueNaN()}(yRelative) ? yRelative : offset.y + yRelative;
            }
            
            if (isStairs && isLastPoint) {
                bool isLastPart = ${isLastPart()}(partIndex);
                
                if (isLastPart) {
                    x = uRightestPoint.x;
                    color = uRightestPoint.z;
                    width = uRightestPoint.w;
                } else {
                    int rightPointPartIndex = ${getPartIndex()}(absVisIndex + 1.);
                    vec2 rightPointOffset = uPartsOffset[rightPointPartIndex];
                    vec2 rightPointStoreXY = uPartsStoreCoord[rightPointPartIndex];
                    vec4 point = texelFetch(uPartsStore, ivec2(rightPointStoreXY), 0);

                    x = rightPointOffset.x + point.x;
                    color = point.z;
                    width = point.w;
                }
            } else {
                vec4 point = texelFetch(uPartsStore, ivec2(storeXY.x + partPointIndex, storeXY.y), 0);
                
                x = offset.x + point.x;
                color = point.z;
                width = point.w;
            }
            
            return vec4(x, y, color, width);
        }
    `;
});

const getCanvasPoint = funcGLSL(() => (name) => {
    // language=GLSL
    return glsl`
        vec2 ${name}(mat3 mat, vec2 relativeOffset) {
            return (mat * vec3(relativeOffset.x, -relativeOffset.y, 1.)).xy;
        }
    `;
});

const getWorldWidth = funcGLSL(() => (name) => {
    // language=GLSL
    return glsl`
        vec2 ${name}(float width) {
            return vec2(
                width * projectionMatrix[0][0],
                width * -projectionMatrix[1][1]
            );
        }
    `;
});

const getMinWidthTime = funcGLSL(() => (name) => {
    // language=GLSL
    return glsl`
        float ${name}(float width) {
            return width <= 2.
                ? width / worldTransform[0][0]
                : 0.;
        }
    `;
});

const pickValue = funcGLSL(
    () => (name) => {
        // language=GLSL
        return glsl`
            float ${name}(float a, float b, bool preferA) {
                return preferA
                    ? a != 0.0 ? a : b
                    : b != 0.0 ? b : a;
            }
        `;
    },
    'pickValue',
);

const renderPoints =
    // language=GLSL
    glsl`
        vec4 point = ${getPoint()}(pointIndex);
        vec2 absPoint = ${getCanvasPoint()}(uFinalMatrix, point.xy);
        
        vec2 position = ${computePointVertexPosition()}(
            vertexIndex,
            absPoint,
            vec2(point.w) * mat2(projectionMatrix)
        );

        pointColor = ${glslUnpackRGBA()}(point.z);
        gl_Position = vec4(position, 0.0, 1.0);
    `;

const renderDots =
    // language=GLSL
    glsl`
        vec4 point = ${getPoint()}(pointIndex);
        vec2 absPoint = ${getCanvasPoint()}(uFinalMatrix, point.xy);
        
        circleCoord = ${getRoundJoinsBasis()}(vertexIndex);
        vec2 position = ${computeRoundJoinsVertexPosition()}(
            absPoint,
            circleCoord * point.w * mat2(projectionMatrix)
        );

        pointColor = ${glslUnpackRGBA()}(point.z);
        gl_Position = vec4(position, 0.0, 1.0);
    `;

const renderArea =
    // language=GLSL
    glsl`
        vec4 pointA = ${getPoint()}(pointIndex);
        vec4 pointB = ${getPoint()}(pointIndex + 1.);
        
        vec2[2] absPoints = vec2[2](
            ${getCanvasPoint()}(uFinalMatrix, pointA.xy),
            ${getCanvasPoint()}(uFinalMatrix, pointB.xy)
        );
         
        vec2 position = ${computeTrapezeVertexPosition()}(
            vertexIndex,
            absPoints
        );
        
        float color = ${pickValue()}(pointA.z, pointB.z, vertexIndex < 3);
        
        pointColor = ${glslUnpackRGBA()}(color);
        gl_Position = vec4(position, 0., 1.);
    `;

const renderLines =
    // language=GLSL
    glsl`
        vec4 pointA = ${getPoint()}(pointIndex);
        vec4 pointB = ${getPoint()}(pointIndex + 1.);
        float width = ${pickValue()}(pointA.w, pointB.w, true);
        
        vec2 pointBCoord = ${prepareSecondPoint()}(
            pointA.xy,
            pointB.xy,
            ${getMinWidthTime()}(width)
        );
        vec2[2] absPoints = vec2[2](
            ${getCanvasPoint()}(uFinalMatrix, pointA.xy),
            ${getCanvasPoint()}(uFinalMatrix, pointBCoord.xy)
        );

        float color;
        vec2 position;

        // compute vertex for lines
        if (vertexIndex < 6) {
            vec2 rectBasis = ${getRectBasis()}(vertexIndex);
            float width = ${pickValue()}(pointA.w, pointB.w, rectBasis.x == 0.0);

            color = ${pickValue()}(pointA.z, pointB.z, rectBasis.x == 0.0);
            position = ${computeRectVertexPosition()}(
                absPoints,
                rectBasis,
                ${getWorldWidth()}(width)
            );
        } else { // compute vertex for joins
            circleCoord = ${getRoundJoinsBasis()}(vertexIndex - 6);
            color = ${pickValue()}(pointB.z, pointA.z, true);
            position = ${computeRoundJoinsVertexPosition()}(
                absPoints[1],
                circleCoord * pointB.w * mat2(projectionMatrix)
            );
        }

        pointColor = ${glslUnpackRGBA()}(color);
        gl_Position = vec4(position, 0.0, 1.0);
    `;

const DEFAULT_CIRCLE_COORD = -1;

const COUNT_ARRAYS = 3; // uPartsOffset, uPartsStoreCoord, uPartsSizeCumulativeSum
export const MAX_ARR_LENGTH = Math.floor(MAX_VERTEX_UNIFORM_VECTORS / COUNT_ARRAYS);

export const vertexShader = buildShader({
    uniforms: {
        uInstanceSize: 'int',

        uType: 'float', // 0 - Points, 1 - Lines, 2 - Stairs, 3 - Area, 4 - Dots
        uLeftestPoint: 'vec4',
        uRightestPoint: 'vec4',
        uPartsStore: 'sampler2D',
        uPartsOffset: `vec2[${Math.floor(MAX_ARR_LENGTH / 2)}]`,
        uPartsStoreCoord: `vec2[${Math.floor(MAX_ARR_LENGTH / 2)}]`,
        uPartsSizeCumulativeSum: `float[${MAX_ARR_LENGTH}]`,

        uFinalMatrix: 'mat3',
        worldTransform: 'mat3',
        projectionMatrix: 'mat3',
    },
    attributes: {
        aVertexID: 'float',
    },
    // language=GLSL
    body: glsl`
        out vec4 pointColor;
        out vec2 circleCoord;
        
        void main() {
            circleCoord = vec2(${DEFAULT_CIRCLE_COORD});
            
            float absVertexIndex = ${HAS_BROKEN_VERTEX_ID ? 'aVertexID' : ' float(gl_VertexID)'};
            float pointIndex = ${getPointIndex()}(absVertexIndex);
            int vertexIndex = ${getVertexIndex()}(absVertexIndex);

            if (uType == 3./*Area*/) {
                ${renderArea}
            } else if (uType == 2./*Stairs*/ || uType == 1./*Lines*/) {
                ${renderLines}
            } else if (uType == 4./*Dots*/) {
                ${renderDots}
            } else {
                // Default render
                ${renderPoints}
            }
        }
    `,
});

const fragmentShader = buildShader({
    // language=GLSL
    body: glsl`
        in vec4 pointColor;
        in vec2 circleCoord;
        out vec4 fragColor;

        // https://webgl2fundamentals.org/webgl/lessons/webgl-qna-the-fastest-way-to-draw-many-circles.html
        float circle(in vec2 dist) {
            return 1.0 - smoothstep(
                1. - (1. * 0.01),
                1. + (1. * 0.01), 
                dot(dist, dist) * 4.0
            );
        }
        
        void main() { 
            if (int(circleCoord.x) != ${DEFAULT_CIRCLE_COORD} && circle(circleCoord) < 0.5) {
                discard;
            }
            
            fragColor = pointColor;
        }
    `,
});

export function getChartPartsShader() {
    return Shader.from(vertexShader.shader, fragmentShader.shader);
}
