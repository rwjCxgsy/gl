
import * as THREE from "three";
import { toColor, toVec, toVec4 } from "./utils";
import { vertexShader } from "./shader";
import {vec4, vec3, vec2, mat4} from 'gl-matrix'
import { Triangle } from "./const";



export class Renderer {




    frame: ImageData
    list: Array<THREE.Mesh> = [];
    ctx: CanvasRenderingContext2D;
    depthBuffer: Float32Array;
    colorBuffer: Uint8ClampedArray;
    v4: vec4;
    half: vec3;
    triangle: Triangle;
    v3: vec3;


    constructor(public canvas: HTMLCanvasElement, public WIDTH = 256, public HEIGHT = 256) {
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        this.ctx.canvas.width = WIDTH;
        this.ctx.canvas.height = HEIGHT;
        this.ctx.canvas.style.width = WIDTH + "px";
        this.ctx.canvas.style.height = HEIGHT + "px";

        this.depthBuffer = new Float32Array(new Array(WIDTH * WIDTH).fill(1));
        this.frame = new ImageData(WIDTH, WIDTH);
        this.colorBuffer = this.frame.data

        this.v4 = vec4.create()
        this.v3 = vec3.create()
        this.half = vec3.fromValues(WIDTH / 2, HEIGHT / 2, 1)
        
    }

    add(obj: THREE.Mesh) {
        this.list.push(obj);
    }


    cache: Map<THREE.Mesh, any> = new Map()

    render(camera: THREE.PerspectiveCamera) {

        const { half} = this

        this.list.forEach((v) => {
            const {
                attributes: { position, color },
                index,
            } = v.geometry;

            const _mat4 = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
            const proMat4 = mat4.fromValues(..._mat4.toArray())

            let [points, colors] = this.cache.get(v) || []
            if (!points) {
               points = toVec4(position.array);
               colors = toVec(color.array);
               this.cache.set(v, [points, colors])
            }
            for (let i = 0, k = 0; i < index!.array.length; i += 3, k++) {
                const k1 = index!.array[i];
                const k2 = index!.array[i + 1];
                const k3 = index!.array[i + 2];


                // 每三个顶点构建一个三角形
                const a = points[k1];
                const b = points[k2];
                const c = points[k3];

                const d = colors[k1];
                const e = colors[k2];
                const f = colors[k3];
                // TODO: vertex Shader
                const triangle = {a: vec3.create(), b: vec3.create(), c: vec3.create()}


                {
                    vec4.transformMat4(a, a, proMat4)
                    vec4.scale(a, a, 1 / a[3])
                    vec3.multiply(triangle.a, vec3.fromValues(a[0], a[1], (a[2] + 1) / 2), half)
                }
                
                {
                    vec4.transformMat4(b, b, proMat4)
                    vec4.scale(b, b, 1 / b[3])
                    vec3.multiply(triangle.b, vec3.fromValues(b[0], b[1], (b[2] + 1) / 2), half)
                }

                {
                    vec4.transformMat4(c, c, proMat4)
                    vec4.scale(c, c, 1 / c[3])
                    vec3.multiply(triangle.c, vec3.fromValues(c[0], c[1], (c[2] + 1) / 2), half)
                }


                const v3 = vec3.create()
                vec2.cross(v3, 
                    vec2.fromValues(
                        triangle.b[0] - triangle.a[0],
                        triangle.b[1] - triangle.a[1],
                    ),
                    vec2.fromValues(
                        triangle.c[0] - triangle.a[0],
                        triangle.c[1] - triangle.a[1],
                    )
                )


                if (v3[2] < 0) {
                    const color_triangle = {a: d, b: e, c: f}
                    vertexShader(triangle, color_triangle);
                }
                // TODO fragment Shader

                // projection()
                // format([])
            }
        });

        this.draw();
    }



    draw() {
        this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
        this.ctx.putImageData(ColorBuffer, 0, 0);
        clearBuffer(0)
        clearBuffer(1)
    }
}
