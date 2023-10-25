

export const WIDTH = 256;
export const HEIGHT = 256


export const DepthBuffer = new Float32Array(WIDTH * WIDTH)



export const ColorBuffer = new ImageData(WIDTH , HEIGHT)


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
            clear(DepthBuffer)
            break;
        case 0:
            clear(ColorBuffer)
            break;
    }
}
