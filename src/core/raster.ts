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
                const color = computeColor(triangle2, point, triangleColor)
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

function computeDepth(triangle: THREE.Vector3[], point: THREE.Vector2): number {
    const triangle2 = triangle.map(v => new THREE.Vector2(v.x, v.y))
    const result = getIntersectionPoint([...triangle2[0], ...triangle2[1]], [...triangle2[2], ...point.toArray()])
    if (!result) {
        throw new Error('No intersection point' + point.toArray())
    }
    
    const crossPoint = new THREE.Vector2(result[0], result[1])
    let depth: number;
    {
        const s = new THREE.Vector2().subVectors(crossPoint, triangle2[0]).length()
        const length = new THREE.Vector2().subVectors(triangle2[1], triangle2[0]).length()
        depth = triangle[0].z + (triangle[1].z - triangle[0].z) * (s / length)
    }
    {
        const s = new THREE.Vector2().subVectors(point, crossPoint).length()
        const length = new THREE.Vector2().subVectors(triangle2[2], crossPoint).length()
        depth = depth + (triangle[2].z - depth) * (s / length)
    }

    return depth;
    
}


function getIntersectionPoint(line1: number[], line2: number[]) {
    // 提取线段的坐标
    const [x1, y1, x2, y2] = line1;
    const [x3, y3, x4, y4] = line2;
  
    // 计算向量
    const uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    const uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
  
    // 判断是否相交
    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
      // 计算交点的坐标
      const intersectionX = x1 + uA * (x2 - x1);
      const intersectionY = y1 + uA * (y2 - y1);
      return [intersectionX, intersectionY];
    }
  
    // 若无交点，则返回 null
    return null;
  }