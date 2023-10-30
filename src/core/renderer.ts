import { DepthBuffer, ColorBuffer, WIDTH, HEIGHT, clearBuffer } from "./buffer";
import * as THREE from "three";
import { toColor, toVec } from "./utils";
import { format } from "./raster";


const v4 = new THREE.Vector4()

const half = new THREE.Vector3(WIDTH / 2, HEIGHT / 2, 1)

const modify = new THREE.Triangle()
export class Renderer {
    public depthBuffer = DepthBuffer;
    public colorBuffer = ColorBuffer;

    list: Array<THREE.Mesh> = [];
    ctx: CanvasRenderingContext2D;
    constructor(public canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        this.ctx.canvas.width = WIDTH;
        this.ctx.canvas.height = HEIGHT;
        this.ctx.canvas.style.width = WIDTH + "px";
        this.ctx.canvas.style.height = HEIGHT + "px";
    }

    add(obj: THREE.Mesh) {
        this.list.push(obj);
    }


    cache = new Map()

    render(camera: THREE.PerspectiveCamera) {
        this.list.forEach((v) => {
            const {
                attributes: { position, color },
                index,
            } = v.geometry;

            const mat4 = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
            let [points, colors] = this.cache.get(v) || []
            if (!points) {
               points = toVec(position.array);
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

                // 投影计算
                const transform = [a, b, c].map((v) => {
                    v4.set(v.x, v.y, v.z, 1).applyMatrix4(mat4);
                    v4.multiplyScalar(1 / v4.w);
                    return new THREE.Vector3(v4.x, v4.y, (v4.z + 1) / 2).multiply(half);
                });


                modify.a = transform[0]
                modify.b = transform[1]
                modify.c = transform[2]
                


                //  背面剔除
                const a2b = new THREE.Vector2().subVectors(new THREE.Vector2(modify.b.x, modify.b.y), new THREE.Vector2(modify.a.x, modify.a.y))
                const a2c = new THREE.Vector2().subVectors(new THREE.Vector2(modify.c.x, modify.c.y), new THREE.Vector2(modify.a.x, modify.a.y))
                if (a2c.cross(a2b) < 0) {
                    this.vertexShader(modify, new THREE.Triangle(d, e, f));
                }





                // TODO fragment Shader

                // projection()
                // format([])
            }
        });

        this.draw();
    }

    /**
     * 计算顶点，深度测试，返回通过测试的片元
     *
     */
    vertexShader(triangle: THREE.Triangle, triangleColor: THREE.Triangle): THREE.Vector2[] {

        let x, y;
        format(triangle, triangleColor, (data) => {
            const [depth, _x, _y, r, g, b] = data;
            x = Math.floor(_x + WIDTH / 2) ;
            y = Math.floor(HEIGHT - (_y + HEIGHT / 2));
            if (DepthBuffer[y * WIDTH + x] > depth) {
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
        ColorBuffer.data[y * WIDTH * 4 + x * 4] = (r * 255) | 0;
        ColorBuffer.data[y * WIDTH * 4 + x * 4 + 1] = (g * 255) | 0;
        ColorBuffer.data[y * WIDTH * 4 + x * 4 + 2] = (b * 255) | 0;
        ColorBuffer.data[y * WIDTH * 4 + x * 4 + 3] = 255;
    }

    draw() {
        this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
        this.ctx.putImageData(ColorBuffer, 0, 0);
        clearBuffer(0)
        clearBuffer(1)
    }
}
