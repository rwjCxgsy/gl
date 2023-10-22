


export const depthBuffer = new Float32Array(256 * 256)


export const colorBuffer = new Uint8ClampedArray(256 * 256 * 4)


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
