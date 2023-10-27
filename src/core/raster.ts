import * as THREE from 'three'
import { MathUtils } from './_utils';





export function pointRect(triangle: THREE.Triangle): number[] {
    const triangle2 = [triangle.a, triangle.b, triangle.c].map(v => new THREE.Vector2(v.x, v.y))
    const xs = triangle2.map(v => v.x);
    const ys = triangle2.map(v => v.y);
    const minX = Math.min(...xs)
    const minY = Math.min(...ys)
    const maxX = Math.max(...xs)
    const maxY = Math.max(...ys)
    return [minX, minY, maxX, maxY].map(v => Math.floor(v))
}


export function format(triangle: THREE.Triangle, triangleColor: THREE.Triangle, callback: (info: Float32Array) => void) {


    const [minX, minY, maxX, maxY] = pointRect(triangle)

    for (let j = minY; j < maxY; j++) {
        for (let i = minX; i < maxX; i++) {
        const point = new THREE.Vector2(i, j)
            const bool = triangle.containsPoint(new THREE.Vector3(point.x, point.y, 0))

            if (bool) {
                // 颜色插值
                const color = computeColor(triangle, point, triangleColor)
                // 深度插值
                const depth = computeDepth(triangle, point)

                callback(new Float32Array([depth, ...point.toArray(), ...color.toArray()]))
                // callback?.(new THREE.Vector3(point.x, point.y, 0))
            }
        }
    }
}


/**
 * @description 检查点是否在三角形内
 * @param {THREE.Triangle} triangle
 * @param {THREE.Vector2} point
 * @return {*} 
 */
function computePointInTriangle(triangle: THREE.Triangle, point: THREE.Vector2): boolean {
    const vec2 = triangle.map(v => new THREE.Vector2().subVectors(point, v))
    const edge = [...triangle, triangle.a]
    const bool: boolean[] = []

    for (let i = 0; i < edge.length - 1; i++) {
        const to = new THREE.Vector2().subVectors(edge[i + 1], edge[i])
        bool.push(vec2[i].cross(to) >= 0)
    }
    return new Set(bool).size === 1
}

/**
 * @description 计算颜色
 * @param {THREE.Triangle} triangle
 * @param {THREE.Vector2} point
 * @param {THREE.Triangle} triangleColor
 * @return {*}  {THREE.Color}
 */
function computeColor(triangle: THREE.Triangle, point: THREE.Vector2, triangleColor: THREE.Triangle): THREE.Color {
    // const distances = triangle.map((v) => 1 / v.distanceTo(point))
    // const color = distances.map((v, index) => triangleColor[index].multiplyScalar(v)).reduce((a, b) => a.clone().add(b)).multiplyScalar(distances.reduce((a, b) => a + b))

    const uvw = new THREE.Vector3()
    triangle.getBarycoord(new THREE.Vector3(point.x, point.y, 0), uvw);
    const {x: u, y: v, z:w} = uvw;
    const red = triangleColor.a.x * u + triangleColor.b.x * v + triangleColor.c.x * w
    const green = triangleColor.a.y * u + triangleColor.b.y * v + triangleColor.c.y * w
    const blue = triangleColor.a.z * u + triangleColor.b.z * v + triangleColor.c.z * w
    return new THREE.Color(red, green, blue)
}

function computeDepth(triangle: THREE.Triangle, point: THREE.Vector2): number {
    const triangle2 = [triangle.a, triangle.b, triangle.c].map(v => new THREE.Vector2(v.x, v.y))
    
    const result = MathUtils.getSegmentCrossPoint([triangle2[0], triangle2[1]], [triangle2[2], point])
    if (!result) {
        throw new Error('No intersection point' + point.toArray())
    }
    
    const crossPoint = new THREE.Vector2(result[0], result[1])
    let depth: number;
    {
        const s = new THREE.Vector2().subVectors(crossPoint, triangle2[0]).length()
        const length = new THREE.Vector2().subVectors(triangle2[1], triangle2[0]).length()
        depth = triangle.a.z + (triangle.b.z - triangle.a.z) * (s / length)
    }
    {
        const s = new THREE.Vector2().subVectors(point, crossPoint).length()
        const length = new THREE.Vector2().subVectors(triangle2[2], crossPoint).length()
        depth = depth + (triangle.c.z - depth) * (s / length)
    }

    return depth;
    
}


function getIntersectionPoint(seg1Start: THREE.Vector2, seg1End: THREE.Vector2, seg2Start: THREE.Vector2, seg2End: THREE.Vector2) {
    const dir1 = new THREE.Vector2().subVectors(seg1End, seg1Start);
    const dir2 = new THREE.Vector2().subVectors(seg2End, seg2Start);
  
    const denominator = dir1.x * dir2.y - dir1.y * dir2.x;
    
    if (denominator === 0) {
      // 平行或共线的情况
      return null;
    }
  
    const diffStarts = new THREE.Vector2().subVectors(seg2Start, seg1Start);
    const t = (diffStarts.x * dir2.y - diffStarts.y * dir2.x) / denominator;
    const u = (diffStarts.x * dir1.y - diffStarts.y * dir1.x) / denominator;
  
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      // 计算交点坐标
      const intersection = new THREE.Vector2();
      intersection.x = seg1Start.x + t * dir1.x;
      intersection.y = seg1Start.y + t * dir1.y;
      return intersection;
    } else {
      // 两条线段不相交
      return null;
    }
  }