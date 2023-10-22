import * as THREE from 'three'


type Triangle = [THREE.Vector2,THREE.Vector2,THREE.Vector2]
type TriangleColor = [THREE.Color,THREE.Color,THREE.Color]



export function format(triangle: Triangle, colors: TriangleColor, buffer: Uint8ClampedArray) {
    const box = triangle.slice(1).reduce((a, b) => {
        return a.union(new THREE.Box2(b));
    }, new THREE.Box2())

    const {min, max} = box
    const {x: minX, y: minY} = min
    const {x: maxX, y: maxY} = max
    for (let j = minY; j < maxY; j++) {
        for (let i = minX; i < maxX; i++) {
            const bool = computePointInTriangle(triangle, new THREE.Vector2())
            if (bool) {
                const color = computeColor(triangle, new THREE.Vector2(i, j), colors)
                const [r, g, b] = color.toArray()
                buffer[j * 256 + i * 4] = Math.round(r * 255)
                buffer[j * 256 + i * 4 + 1] = Math.round(g * 255)
                buffer[j * 256 + i * 4 + 2] = Math.round(b * 255)
                buffer[j * 256 + i * 4 + 3] = 255
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