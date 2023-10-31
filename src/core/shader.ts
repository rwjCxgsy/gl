import * as THREE from "three";
import { format } from "./raster";
import { Triangle } from "./const";


/**
 * 计算顶点，深度测试，返回通过测试的片元
 *
 */
export function vertexShader(triangle: Triangle, triangleColor: Triangle): THREE.Vector2[] {
    let x, y;

    format(triangle, triangleColor, (data) => {
        const [depth, _x, _y, r, g, b] = data;
        x = Math.floor(_x + WIDTH / 2);
        y = Math.floor(HEIGHT - (_y + HEIGHT / 2));
        if (DepthBuffer[y * WIDTH + x] > depth) {
            // 更新 深度
            DepthBuffer[y * WIDTH + x] = depth;
            fragmentShader([x, y, r, g, b]);
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
export function fragmentShader(data: number[]) {
    const [x, y, r, g, b] = data;
    ColorBuffer.data[y * WIDTH * 4 + x * 4] = (r * 255) | 0;
    ColorBuffer.data[y * WIDTH * 4 + x * 4 + 1] = (g * 255) | 0;
    ColorBuffer.data[y * WIDTH * 4 + x * 4 + 2] = (b * 255) | 0;
    ColorBuffer.data[y * WIDTH * 4 + x * 4 + 3] = 255;
}
