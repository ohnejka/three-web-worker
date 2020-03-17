/// <reference lib="webworker" />
import * as THREE from 'three';
import { Handlers } from './Handlers';
import { IMessage, ISize } from './IMessage';
// import * as THREE from '../assets/libs/three.min.js';
import { isNotDefined } from './utils';


addEventListener('message', ({ data }) => {
  worker.listen(data);
});

class MyWorker {
  private handlers = [Handlers.Main, Handlers.Size];
  private canvas: OffscreenCanvas;
  private width = 0;
  private height = 0;

  private initialized = false;

  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private cubes: THREE.Mesh[];

  public listen(e: IMessage | ISize): void {

    if (this.handlers.indexOf(e.type) < 0) {
      throw new Error('no handler for type: ' + e.type);
    }

    if (e.type === Handlers.Main) {
      this.canvas = (e as IMessage).data;
      this.initialized = this.initThree();
      return;
    }

    if (e.type === Handlers.Size && this.initialized) {
      this.width = (e as ISize).width;
      this.height = (e as ISize).height;

      // console.log(`w: ${this.width}, h: ${this.height}`)

      this.renderer.setSize(this.width , this.height, false);

      this.camera.aspect = this.width /this.height;
      this.camera.updateProjectionMatrix();
      return;
    }

    console.log(`do nothing with type ${e.type}`)
  }

  private initThree(): boolean {
    if(isNotDefined(this.canvas))
      return;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas});
    this.renderer.setClearColor(0x000000);

    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 5;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.z = 2;

    this.scene = new THREE.Scene();

    //
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    this.scene.add(light);
    //

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    this.cubes = [
      this.makeInstance(geometry, 0x44aa88,  0),
      this.makeInstance(geometry, 0x8844aa, -2),
      this.makeInstance(geometry, 0xaa8844,  2),
    ];

    requestAnimationFrame(this.render);

    return true;
  }

  private makeInstance(geometry: THREE.Geometry, color: any, x: number): THREE.Mesh {
    const material = new THREE.MeshPhongMaterial({color});

    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = x;
    this.scene.add(cube);

    return cube;
  }

  private render = (time: number): void =>  {
    time *= 0.001;

    this.cubes.forEach((cube, ndx) => {
      const speed = 1 + ndx * .1;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;
    });

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render);
  }

}

const worker = new MyWorker();
