



// const xs = new Int32Array([0, 0, 0]);

import { vec2, vec3 } from "gl-matrix";
import { Triangle, TriangleV2 } from "./const";

// const ys = new Int32Array([0, 0, 0]);
export function pointRect(triangle: Triangle): number[] {


    let minX = triangle.a[0];
    let maxX = triangle.a[0];
    let minY = triangle.a[1];
    let maxY = triangle.a[1];

    [triangle.b, triangle.c].forEach(item => {
        minX = item[0] < minX ? item[0] : minX
        maxX = item[0] > maxX ? item[0] : maxX
        minY = item[1] < minY ? item[1] : minY
        maxY = item[1] > maxY ? item[1] : maxY
    });


    return [Math.floor(minX), Math.floor(minY), Math.ceil(maxX), Math.ceil(maxY)];
}

const point = vec2.create()
// const triangle_v2: TriangleV2 = {
//     a: vec2.create(),
//     b: vec2.create(),
//     c: vec2.create()
// }
export function format(triangle: Triangle, triangleColor: Triangle, callback: (info: Float32Array) => void) {
    const [minX, minY, maxX, maxY] = pointRect(triangle);

    const triangle_v2: TriangleV2 = {
        a: vec2.fromValues(triangle.a[0], triangle.a[1]),
        b: vec2.fromValues(triangle.b[0], triangle.b[1]),
        c: vec2.fromValues(triangle.c[0], triangle.c[1])
    }

    for (let j = minY; j < maxY; j++) {
        for (let i = minX; i < maxX; i++) {
            point[0] = i
            point[1] = j

            const bool = computePointInTriangle(triangle_v2 , point);

            if (bool) {
                // 颜色插值
                const color = computeColor(triangle, point, triangleColor);
                // 深度插值
                const depth = computeDepth(triangle, new Vector2(point.x, point.y));
                callback(new Float32Array([depth, ...point.toArray(), ...color]));
                // callback?.(new Vector3(point.x, point.y, 0))
            }
        }
    }
}
const out = vec2.create()
/**
 * @description 检查点是否在三角形内
 * @param {Triangle} triangle
 * @param {Vector2} point
 * @return {*}
 */
function computePointInTriangle(triangle: TriangleV2, point: vec2): boolean {
    // const vec2 = triangle.map((v) => new Vector2().subVectors(point, v));
    // const edge = [...triangle, triangle.a];
    const bool: boolean[] = [];



    {
      vec2.sub(out, )
    }

    for (let i = 0; i < edge.length - 1; i++) {
        const to = new Vector2().subVectors(edge[i + 1], edge[i]);
        bool.push(vec2[i].cross(to) >= 0);
    }
    return new Set(bool).size === 1;
}


const uvw = new Vector3();
/**
 * @description 计算颜色
 * @param {Triangle} triangle
 * @param {Vector2} point
 * @param {Triangle} triangleColor
 * @return {*}  {Color}
 */
function computeColor(triangle: Triangle, point: Vector3, triangleColor: Triangle): number[] {
    triangle.getBarycoord(point, uvw);
    const { x: u, y: v, z: w } = uvw;
    return [
        triangleColor.a.x * u + triangleColor.b.x * v + triangleColor.c.x * w,
        triangleColor.a.y * u + triangleColor.b.y * v + triangleColor.c.y * w,
        triangleColor.a.z * u + triangleColor.b.z * v + triangleColor.c.z * w
    ]
}

function computeDepth(triangle: Triangle, point: Vector2): number {
    const triangle2 = [triangle.a, triangle.b, triangle.c].map((v) => new Vector2(v.x, v.y));

    const result = MathUtils.getSegmentCrossPoint([triangle2[0], triangle2[1]], [triangle2[2], point]);
    if (!result) {
        throw new Error("No intersection point" + point.toArray());
    }

    const crossPoint = result.data as Vector2;
    let depth: number;
    {
        const s = new Vector2().subVectors(crossPoint, triangle2[0]).length();
        const length = new Vector2().subVectors(triangle2[1], triangle2[0]).length();
        depth = triangle.a.z + (triangle.b.z - triangle.a.z) * (s / length);
    }

    {
        const s = new Vector2().subVectors(point, crossPoint).length();
        const length = new Vector2().subVectors(triangle2[2], crossPoint).length();
        depth = depth + (triangle.c.z - depth) * (s / length);
    }

    return depth;
}


