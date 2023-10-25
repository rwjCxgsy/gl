import * as THREE from 'three'


export type Triangle = THREE.Vector2[]
export type Triangle3 = THREE.Vector3[]
export type TriangleColor = THREE.Color[]



export function format(triangle: Triangle3, triangleColor: TriangleColor, callback: (info: Float32Array) => void) {
    const triangle2 = triangle.map(v => new THREE.Vector2(v.x, v.y))
    const box = triangle.slice(1).reduce((a, b) => {
        return a.union(new THREE.Box2(new THREE.Vector2(b.x, b.y)));
    }, new THREE.Box2())

    const {min, max} = box
    const {x: minX, y: minY} = min
    const {x: maxX, y: maxY} = max
    for (let j = minY; j < maxY; j++) {
        for (let i = minX; i < maxX; i++) {
            const point = new THREE.Vector2(i, j)
            const bool = computePointInTriangle(triangle2, point)
            if (bool) {
                // 颜色插值
                computeColor(triangle2, point, triangleColor)
                // 深度插值
                // callback?.(new THREE.Vector3(point.x, point.y, 0))
            }
        }
    }
}


/**
 * @description 检查点是否在三角形内
 * @param {Triangle} triangle
 * @param {THREE.Vector2} point
 * @return {*} 
 */
function computePointInTriangle(triangle: Triangle, point: THREE.Vector2): boolean {
    const bool = triangle.map(v => point.cross(v) >= 0 ? 1: -1)
    return new Set(bool).size === 1
}

/**
 * @description 计算颜色
 * @param {Triangle} triangle
 * @param {THREE.Vector2} point
 * @param {TriangleColor} triangleColor
 * @return {*}  {THREE.Color}
 */
function computeColor(triangle: Triangle, point: THREE.Vector2, triangleColor: TriangleColor): THREE.Color {
    const distances = triangle.map((v) => 1 / v.distanceTo(point))
    const color = distances.map((v, index) => triangleColor[index].multiplyScalar(v)).reduce((a, b) => a.add(b)).multiplyScalar(distances.reduce((a, b) => a + b))
    return color
}