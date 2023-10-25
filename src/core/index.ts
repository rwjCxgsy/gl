
import  * as THREE from 'three'
import {depthBuffer, WIDTH, HEIGHT, colorBuffer} from './buffer'
import {format, Triangle, Triangle3, TriangleColor} from './raster'


/**
 * @description 转换顶点数组
 * @param {Float32Array} buffer
 * @return {*}  {THREE.Vector3[]}
 */
function toPoints (buffer: THREE.TypedArray): THREE.Vector3[] {
    const points: THREE.Vector3[] = []
    for (let i = 0; i < buffer.length; i+=3) {
        const a = buffer[i]
        const b = buffer[i+1]
        const c = buffer[i+2]
        points.push(new THREE.Vector3(a, b, c))
    }
    return points
}

/**
 * @description 转换颜色
 * @param {Float32Array} buffer
 * @return {*}  {THREE.Color[]}
 */
function toColor (buffer: THREE.TypedArray): THREE.Color[] {
    const colors: THREE.Color[] = []
    for (let i = 0; i < buffer.length; i+=3) {
        const a = buffer[i]
        const b = buffer[i+1]
        const c = buffer[i+2]
        colors.push(new THREE.Color(a, b, c))
    }
    return colors
}

/**
 * @description 计算投影
 * @param {THREE.PerspectiveCamera} camera
 * @param {THREE.Vector3[]} points
 */
function projection (camera: THREE.PerspectiveCamera, points: THREE.Vector3[]){
    const mat4 = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)

    const vec3 = points.map(v => v.clone().applyMatrix4(mat4))
}

/**
 * 计算顶点，深度测试，返回通过测试的片元
 *
 */
function vertexShader (triangle: Triangle3, triangleColor: TriangleColor, buffer: Float32Array, mat: THREE.Matrix4): THREE.Vector2[] {
    // 投影计算
    const transform = triangle.map(v => v.applyMatrix4(mat))
    

    
    format(transform, triangleColor, (point) => {
        if (depthBuffer[point.y * WIDTH + point.x]) {

        }
    })

    // 计算包围盒

    // 遍历顶点
    // 判断是否再三角形内并插值
    //  深度测试
    return [new THREE.Vector2()]
}





export function renderer (objects: Array<THREE.Mesh>) {

    objects.forEach(v => {
        const {attributes: {position, color}, index} = v.geometry

        const mat = new THREE.Matrix4()
        const points = toPoints(position.array)
        const colors = toColor(color.array)
        for (let i = 0, k = 0; i < index!.array.length; i+=3, k++) {
            // 每三个顶点构建一个三角形
            const a = points[i]
            const b = points[i + 1]
            const c = points[i + 2]

            const d = points[i]
            const e = points[i + 1]
            const f = points[i + 2]
            // TODO: vertex Shader

            const pass = vertexShader([a, b, c], [d, e, f], depthBuffer, mat)
            
            // TODO fragment Shader

            // projection()
            // format([])
        }
    })
}