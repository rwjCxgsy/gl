import {vec2, vec3, vec4, mat4} from 'gl-matrix'

import * as THREE from 'three'


export type Line = [vec2, vec2]

export type TriangleColor = [vec3, vec3, vec3]

export type Triangle = [vec3, vec3, vec3]

export type Triangle2 = [vec2, vec2, vec2]





export class Lerp {
    static lerpColor(triangle: Triangle, colors: TriangleColor, point: vec2): vec3 {}

    static lerpColor2(triangle: Triangle, colors: TriangleColor, point: vec2): vec3 {}

    static lerpDepth (triangle: Triangle, point: vec2): number {}

    static lerpUv (triangle: Triangle, point: vec2) {}

}




interface Line2 {
    k?: number,
    b?: number,
    x?: number,
    y?: number
}

enum CrossState {
    'equal' = 'equal',
    'parallel' = 'parallel',
    'cross' = 'cross',
}

export class MathUtils {

    static toLine2 (start: THREE.Vector2, end: THREE.Vector2): Line2 {
        const k = (end.y - start.y) / (end.x - start.x)
        const b = start.y - k * start.x
        if (MathUtils.equalNumber(k, -Infinity)) {
            return {x: start.x}
        }
        if (MathUtils.equalNumber(k, -0)) {
            return {y: start.y}
        }
        return {k, b}
    }

    static equalNumber (a: any, b: any): boolean {
        if (a === 0 || a === -0 || a === Infinity || a === -Infinity) {
            return  Math.abs(a) === Math.abs(b)
        }
        return a === b
    }

    static getCrossPoint (line1: Line2, line2: Line2): {data?: THREE.Vector2, statue: CrossState} {
        if (line1.k && line1.k === line2.k) {
            if (line1.b === line2.b) {
                return {statue: CrossState.equal}
            }
            return {statue: CrossState.parallel}
        }
        if (line1.x && line2.y) {
            return {
                data: new THREE.Vector2(line1.x, line2.y), statue: CrossState.cross
            }
        }
        if (line1.x && !line2.y) {
            return {
                data: new THREE.Vector2(line1.x, line2.k * line1.x + line2.b), statue: CrossState.cross
            }
        }

        if (line1.y && line2.x) {
            return {
                data: new THREE.Vector2(line2.x, line1.y), statue: CrossState.cross
            }
        }
        if (!line1.y && line2.x) {
            return {
                data: new THREE.Vector2(line2.x, line1.k * line2.x + line1.b), statue: CrossState.cross
            }
        }

        const x = (line1.b - line2.b) / (line2.k - line1.k)
        const y = line1.k * x + line1.b
        return {
            data: new THREE.Vector2(x, y), statue: CrossState.cross
        }
    }

    static getSegmentCrossPoint (a: THREE.Vector2[], b: THREE.Vector2[]) {
        const line1 = MathUtils.toLine2(...a)
        const line2 = MathUtils.toLine2(...b)

        return MathUtils.getCrossPoint(line1, line2)
    }
}





