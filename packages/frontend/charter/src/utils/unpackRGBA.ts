import { funcGLSL, glsl } from '../components/utils/shaders/buildShader';

export const glslUnpackRGBA = funcGLSL(() => (name) => {
    // language=GLSL
    return glsl`
        vec4 ${name}(highp float f) {
            int color = floatBitsToInt(f);

            int r = (color & 0xFF) << 1;
            int g = ((color >> 8 ) & 0xFF) << 1;
            int b = ((color >> 16) & 0xFF) << 1;
            int a = ((color >> 24) & 0xFF) << 1;

            return vec4(r, g, b, a) / 255.0;
        }
    `;
});
