// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.tsx'
// import './index.css'

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )

import * as THREE from 'three'
import {Renderer} from './core/renderer'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'



const canvas = document.getElementById('root') as HTMLCanvasElement

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const renderer = new Renderer(canvas)

const box = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20))


const len = box.geometry.attributes['position'].count

const colors = []
for (let i = 0; i < len; i++) {
  colors.push(new THREE.Color().setHex(Math.random() * 0xffffff | 0)  )
}
box.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors.map(v => v.toArray()).flat(1), 3))

renderer.add(box)

const camera = new THREE.PerspectiveCamera(75, 1, 1, 100)
camera.position.set(20, 20, 20.6000001)
camera.lookAt(new THREE.Vector3(0, 0, 0))
camera.updateMatrixWorld()

const controls = new OrbitControls(camera, canvas)

const clock = new THREE.Clock()
const loop = () => {
  requestAnimationFrame(loop)
  controls.update()
  renderer.render(camera)
}
requestAnimationFrame(loop)



