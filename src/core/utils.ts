
import  * as THREE from 'three'
import {DepthBuffer, WIDTH, HEIGHT, ColorBuffer} from './buffer'
import {format, Triangle, Triangle3, TriangleColor} from './raster'


/**
 * @description 转换顶点数组
 * @param {Float32Array} buffer
 * @return {*}  {THREE.Vector3[]}
 */
export function toPoints (buffer: THREE.TypedArray): THREE.Vector3[] {
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
export function toColor (buffer: THREE.TypedArray): THREE.Color[] {
    const colors: THREE.Color[] = []
    for (let i = 0; i < buffer.length; i+=3) {
        const a = buffer[i]
        const b = buffer[i+1]
        const c = buffer[i+2]
        colors.push(new THREE.Color(a, b, c))
    }
    return colors
}



