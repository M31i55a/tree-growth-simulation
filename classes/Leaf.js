import * as THREE from 'three';

export class Leaf {
  constructor() {
    const r = 150;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    this.pos = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta) + 150,
      r * Math.cos(phi)
    );
    this.reached = false;
  }
}
