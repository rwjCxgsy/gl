import {vec4, vec3, vec2, mat4} from 'gl-matrix'

export interface Triangle {
    a: vec3,
    b: vec3,
    c: vec3,
    d?: vec3,
    e?: vec3,
    f?: vec3
}

export interface TriangleV2 {
    a: vec2,
    b: vec2,
    c: vec2,
    d?: vec2,
    e?: vec2,
    f?: vec2
}