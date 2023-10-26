import { DepthBuffer, ColorBuffer, WIDTH, HEIGHT } from "./buffer";
import * as THREE from "three";
import { toColor, toPoints } from "./utils";
import { Triangle3, TriangleColor, format } from "./raster";



export class Renderer {
    public depthBuffer = DepthBuffer;
    public colorBuffer = ColorBuffer;

    list: Array<THREE.Mesh> = [];
    ctx: CanvasRenderingContext2D;
    constructor(public canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    }

    add(obj: THREE.Mesh) {
        this.list.push(obj);
    }

    render(camera: THREE.PerspectiveCamera) {
        this.list.forEach((v) => {
            const {
                attributes: { position, color },
                index,
            } = v.geometry;

            const mat4 = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4(), camera.matrixWorldInverse)
            const points = toPoints(position.array);
            const colors = toColor(color.array);
            for (let i = 0, k = 0; i < index!.array.length; i += 3, k++) {
                const k1 = index!.array[i]
                const k2 = index!.array[i + 1]
                const k3 = index!.array[i + 2]
                // 每三个顶点构建一个三角形
                const a = points[k1];
                const b = points[k2];
                const c = points[k3];

                const d = colors[k1];
                const e = colors[k2];
                const f = colors[k3];
                // TODO: vertex Shader

                this.vertexShader([a, b, c], [d, e, f], mat4);

                this.draw();

                // TODO fragment Shader

                // projection()
                // format([])
            }
        });
    }

    /**
     * 计算顶点，深度测试，返回通过测试的片元
     *
     */
    vertexShader(
        triangle: Triangle3,
        triangleColor: TriangleColor,
        mat: THREE.Matrix4
    ): THREE.Vector2[] {
        // 投影计算
        const transform = triangle.map((v) => {
            const v4 = new THREE.Vector4(v.x, v.y, v.z, 1).applyMatrix4(mat)
            v4.multiplyScalar(1/v4.w)
            return new THREE.Vector3(v4.x, v4.y, (v4.z + 1) / 2)
        });



        format(transform, triangleColor, (data) => {
            const [depth, x, y, r, g, b] = data;
            if (DepthBuffer[y * WIDTH + x] < depth) {
                // 更新 深度
                DepthBuffer[y * WIDTH + x] = depth;
                this.fragmentShader([x, y, r, g, b]);
            }
        });

        // 计算包围盒

        // 遍历顶点
        // 判断是否再三角形内并插值
        //  深度测试
        return [new THREE.Vector2()];
    }

    /**
     * @description 片元着色
     * @param {number[]} arg0
     */
    fragmentShader(data: number[]) {
        const [x, y, r, g, b] = data;
        debugger
        ColorBuffer.data[y * WIDTH * 4 + x * 4] = r;
        ColorBuffer.data[y * WIDTH * 4 + x * 4 + 1] = g;
        ColorBuffer.data[y * WIDTH * 4 + x * 4 + 2] = b;
        ColorBuffer.data[y * WIDTH * 4 + x * 4 + 3] = 255;
    }

    draw () {
        this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
        this.ctx.putImageData(this.colorBuffer, 0, 0)
    }
}
