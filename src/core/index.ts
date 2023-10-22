
import  * as THREE from 'three'
import {depthBuffer, colorBuffer} from './buffer'
import {format} from './raster'


/**
 * @description 转换顶点数组
 * @param {Float32Array} buffer
 * @return {*}  {THREE.Vector3[]}
 */
function toPoints (buffer: Float32Array): THREE.Vector3[] {
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
 * @description 传唤颜色
 * @param {Float32Array} buffer
 * @return {*}  {THREE.Color[]}
 */
function toColor (buffer: Float32Array): THREE.Color[] {
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

    const vec2 = points.map(v => v.clone().applyMatrix4(mat4))

}


function renderer (objects: Array<THREE.Mesh>) {

    objects.forEach(v => {
        const {attributes: {position, color}, index} = v.geometry

        const points = toPoints(position.array)
        const colors = toColor(color.array)
        for (let i = 0, k = 0; i < index!.array.length; i+=3, k++) {

            // projection()

            // format([])
        }
    })
}