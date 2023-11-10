
import * as THREE from "three";
import { toColor, toVec, toVec4 } from "./utils";
// import { vertexShader } from "./shader";
import {vec4, vec3, vec2, mat4} from 'gl-matrix'
import { Triangle } from "./const";
import  {Gl} from './gl'


export class Renderer {




    list: Array<THREE.Mesh> = [];
    ctx: CanvasRenderingContext2D;
    v4: vec4;
    half: vec3;
    v3: vec3;
    gl: Gl;


    constructor(public canvas: HTMLCanvasElement, public WIDTH = 512, public HEIGHT = 512) {
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
        this.ctx.canvas.style.width = window.innerWidth + "px";
        this.ctx.canvas.style.height = window.innerHeight + "px";

        this.gl = new Gl(this.ctx, WIDTH, HEIGHT)



        this.v4 = vec4.create()
        this.v3 = vec3.create()
        this.half = vec3.fromValues(WIDTH / 2, HEIGHT / 2, 1)
        
    }

    add(obj: THREE.Mesh) {
        this.list.push(obj);
    }


    cache: Map<THREE.Mesh, any> = new Map()

    render(camera: THREE.PerspectiveCamera) {

        const { half} = this

        this.gl.clearColorBuffer()
        this.gl.clearDepthBuffer()

        this.list.forEach((v) => {
            const {
                attributes: { position, color },
                index,
            } = v.geometry;

            const _mat4 = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
            const proMat4 = mat4.fromValues(..._mat4.elements)

            // let [points, colors] = this.cache.get(v) || []
            // if (!points) {
            //    points = toVec4(position.array);
            //    colors = toVec(color.array);
            //    this.cache.set(v, [points, colors])
            // }

            this.gl.draw({position: position.array, color: color.array, index: index}, _mat4.elements)

        });

        this.draw();
    }



    draw() {

    }
    
}
