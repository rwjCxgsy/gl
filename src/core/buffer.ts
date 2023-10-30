import { TypedArray } from "three";


export const WIDTH = 256;
export const HEIGHT = 256


export const DepthBuffer = new Float32Array(new Array(WIDTH * WIDTH).fill(1))



export const ColorBuffer = new ImageData(WIDTH , HEIGHT)


function clear (buffer: TypedArray, value = 0) {
    if (!buffer.length) {
        return
    }
    const length = buffer.length

    for (let i = 0; i < length; i++) {
        buffer[i] = value
    }
}


export function clearBuffer(type: 1 | 0){
    switch(type){
        case 1:
            for (let i = 0; i < WIDTH * WIDTH; i++) {
                DepthBuffer[i] = 1
            }
            break;
        case 0:
            for (let i = 0; i < WIDTH * WIDTH * 4; i++) {
                ColorBuffer.data[i] = 0
            }
            break;
    }
}
