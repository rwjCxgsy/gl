





// const xs = new Int32Array([0, 0, 0]);

import { vec2, vec3 } from "gl-matrix";
import { Triangle, TriangleV2 } from "./const";

const _v0 = vec3.create()
const _v1 = vec3.create()
const _v2 = vec3.create()

const color_v0 = vec3.create()
const color_v1 = vec3.create()
const color_v2 = vec3.create()
const color = vec3.create()

let dot00, dot01, dot02, dot11, dot12;
let denom, invDenom, u, v, w;

const result = new Float32Array(5)

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

const point = vec3.create()
// const triangle_v2: TriangleV2 = {
//     a: vec2.create(),
//     b: vec2.create(),
//     c: vec2.create()
// }
export function format(triangle: Triangle, triangleColor: Triangle, callback: (info: Float32Array) => void) {
    const [minX, minY, maxX, maxY] = pointRect(triangle);



    for (let j = minY; j < maxY; j++) {
        for (let i = minX; i < maxX; i++) {
            point[0] = i
            point[1] = j
            point[2] = 0

            const [depth, r, g, b] = computePointInTriangle(triangle, triangleColor, point);
            if (depth !== -1) {
                // 颜色插值
                // const color = computeColor(triangle, point, triangleColor);
                // // 深度插值
                // const depth = computeDepth(triangle, vec2.fromValues(point.x, point.y));
                callback(new Float32Array([depth, i, j, r, g, b]));
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
function computePointInTriangle(triangle: Triangle, colors: Triangle, point: vec3): Float32Array {

    vec3.sub(_v0, triangle.c, triangle.a);
    vec3.sub(_v1, triangle.b, triangle.a);
    vec3.sub(_v2, point, triangle.a);

    dot00 = vec3.dot(_v0, _v0 );
    dot01 = vec3.dot(_v0, _v1 );
    dot02 = vec3.dot(_v0, _v2 );
    dot11 = vec3.dot(_v1, _v1 );
    dot12 = vec3.dot(_v1, _v2 );

    denom = ( dot00 * dot11 - dot01 * dot01 );

    // collinear or singular triangle
    if ( denom === 0 ) {

        // arbitrary location outside of triangle?
        // not sure if this is the best idea, maybe should be returning undefined

        result[0] = -1
        return result

    }

    invDenom = 1 / denom;
    u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
    v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;
    w = 1 - u - v;

    if (w < 0 || u < 0 || v < 0) {
        result[0] = -1
        return result
    }


    vec3.scale(color_v0, colors.a, w);
    vec3.scale(color_v1, colors.b, v);
    vec3.scale(color_v2, colors.c, u);

    vec3.add(color, color_v0, color_v1)
    vec3.add(color, color, color_v2)

    
    // barycentric coordinates must always sum to 1
    // return vec3.fromValues( 1 - u - v, v, u );
    result[1] = color[0];
    result[2] = color[1];
    result[3] = color[2];
    result[0] = Math.random();
    return result
}




function computeDepth(triangle: Triangle, point: vec3): number {
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


