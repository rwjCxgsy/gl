

export const WIDTH = 256;
export const HEIGHT = 256


export const depthBuffer = new Float32Array(WIDTH * WIDTH)


export const colorBuffer = new Uint8ClampedArray(WIDTH * WIDTH * 4)


function clear (buffer: any) {
    if (!buffer.length) {
        return
    }
    const length = buffer.length

    for (let i = 0; i < length; i++) {
        buffer[i] = 0
    }
}


export function clearBuffer(type: 1 | 0){
    switch(type){
        case 1:
            clear(depthBuffer)
            break;
        case 0:
            clear(colorBuffer)
            break;
    }
}
