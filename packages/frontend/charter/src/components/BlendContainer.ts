import type { Renderer } from 'pixi.js';
import { Container } from 'pixi.js';

export class BlendContainer extends Container {
    render(renderer: Renderer) {
        const { gl } = renderer;
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        super.render(renderer);
    }
}
