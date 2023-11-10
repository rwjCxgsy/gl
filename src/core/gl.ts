// import { Triangle } from "./const";

import { mat4, vec2, vec3, vec4 } from "gl-matrix";
import { Triangle, TypedArray } from "./const";
import { toColor, toVec, toVec4 } from "./utils";
import { format } from "./raster";


export class Gl {
    depthBuffer: Float32Array;
    colorBuffer: Uint8ClampedArray;
    frame: ImageData;

    cache = new Map();
    half: vec3;

    // triangle: Triangle;
    constructor(public ctx: CanvasRenderingContext2D, public WIDTH = 512, public HEIGHT = 512) {
        this.initDepthBuffer()
        this.initFrame()

        this.half = vec3.fromValues(WIDTH / 2, HEIGHT / 2, 0);
    }

    initDepthBuffer () {
        const {WIDTH} = this
        this.depthBuffer = new Float32Array(WIDTH * WIDTH);
    }
    initFrame () {
        const {WIDTH} = this
        this.frame = new ImageData(WIDTH, WIDTH);
        this.colorBuffer = this.frame.data;
    }

    shader() {
        // const {WIDTH, HEIGHT} = this
        // this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
        // this.ctx.putImageData(this.frame, 0, 0);
        // this.clearColorBuffer()
        // this.clearDepthBuffer()
    }

    vertexShader(triangle: Triangle, triangleColor: Triangle): vec2 {
        let x, y;

        const { WIDTH, HEIGHT } = this;

        format(triangle, triangleColor, (data) => {
            const [depth, _x, _y, r, g, b] = data;
            x = Math.floor(_x + WIDTH / 2);
            y = Math.floor(HEIGHT - (_y + HEIGHT / 2));
            // this.depthBuffer[y * WIDTH + x] = depth;
            if (this.depthBuffer[y * WIDTH + x] < depth) {
                // 更新 深度
                this.depthBuffer[y * WIDTH + x] = depth;
                this.fragmentShader([x, y, r, g, b]);
            }
        });

        // 计算包围盒

        // 遍历顶点
        // 判断是否再三角形内并插值
        //  深度测试
    }

    draw(buffer: { position: TypedArray; color: TypedArray; index: TypedArray }, proMat4: mat4) {
        const { half } = this;
        let position = this.cache.get(buffer.position);
        let color = this.cache.get(buffer.color);
        if (!position) {
            position = toVec4(buffer.position);
        }
        if (!color) {
            color = toVec(buffer.color);
        }

        const { array: index } = buffer.index;

        const triangle = { a: vec3.create(), b: vec3.create(), c: vec3.create() };
        for (let i = 0, k = 0; i < index.length; i += 3, k++) {

            
            const k1 = index[i];
            const k2 = index[i + 1];
            const k3 = index[i + 2];

            // 每三个顶点构建一个三角形
            const a = position[k1];
            const b = position[k2];
            const c = position[k3];

            const d = color[k1];
            const e = color[k2];
            const f = color[k3];

            const out_a = vec4.create()

            const out_b = vec4.create()
            const out_c = vec4.create()

            {
                vec4.transformMat4(out_a, a, proMat4);
                vec4.scale(out_a, out_a, 1 / out_a[3]);
                vec3.multiply(triangle.a, vec3.fromValues(out_a[0], out_a[1], (out_a[2] + 1) / 2), half);
            }

            {
                vec4.transformMat4(out_b, b, proMat4);
                vec4.scale(out_b, out_b, 1 / out_b[3]);
                vec3.multiply(triangle.b, vec3.fromValues(out_b[0], out_b[1], (out_b[2] + 1) / 2), half);
            }

            {
                vec4.transformMat4(out_c, c, proMat4);
                vec4.scale(out_c, out_c, 1 / out_c[3]);
                vec3.multiply(triangle.c, vec3.fromValues(out_c[0], out_c[1], (out_c[2] + 1) / 2), half);
            }

            const v3 = vec3.create();

            vec2.cross(v3, vec2.fromValues(triangle.b[0] - triangle.a[0], triangle.b[1] - triangle.a[1]), vec2.fromValues(triangle.c[0] - triangle.a[0], triangle.c[1] - triangle.a[1]));

            if (v3[2] > 0) {
                const color_triangle = { a: d, b: e, c: f };
                this.vertexShader(triangle, color_triangle);
            }
        }
        this.ctx.putImageData(this.frame, (window.innerWidth / 2 - this.WIDTH / 2) | 0,( window.innerHeight / 2 - this.HEIGHT / 2) | 0);
    }

    fragmentShader(data: number[]) {
        const { WIDTH } = this;
        const [x, y, r, g, b] = data;
        this.colorBuffer[y * WIDTH * 4 + x * 4] = (r * 255) | 0;
        this.colorBuffer[y * WIDTH * 4 + x * 4 + 1] = (g * 255) | 0;
        this.colorBuffer[y * WIDTH * 4 + x * 4 + 2] = (b * 255) | 0;
        this.colorBuffer[y * WIDTH * 4 + x * 4 + 3] = 255;
    }

    clearColorBuffer() {
        this.initFrame()
        // this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
    }
    clearDepthBuffer() {
        this.initDepthBuffer()
    }
}
