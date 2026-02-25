import * as THREE from 'three';
import { Branch } from './Branch.js';
import { Leaf } from './Leaf.js';
import { createCylinderBetweenPoints } from './helpers.js';

export class Tree {
  constructor(container, params) {
    this.branches = [];
    this.leaves = [];
    this.container = container;
    this.params = params;
    
    this.leafGeometry = new THREE.BufferGeometry();
    this.leafMaterial = new THREE.PointsMaterial({
      color: params.leafColor,
      size: 1.5,
      sizeAttenuation: true,
    });
    this.leafPoints = new THREE.Points(this.leafGeometry, this.leafMaterial);
    this.container.add(this.leafPoints);

    // Initialize leaves
    for (let i = 0; i < params.leafCount; i++) {
      this.leaves.push(new Leaf());
    }

    // Initialize root
    let root = new Branch(null, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 0, params);
    this.branches.push(root);

    // Grow trunk until near leaves
    let current = root;
    let found = false;
    while (!found) {
      for (let l of this.leaves) {
        if (current.pos.distanceTo(l.pos) < params.maxDist) found = true;
      }
      if (!found) {
        let trunk = new Branch(current, current.next(), current.dir, 0, params);
        trunk.mesh = createCylinderBetweenPoints(
          current.pos,
          trunk.pos,
          trunk.radius,
          trunk.radius * params.radiusDecay,
          this.container,
          0,
          params
        );
        this.branches.push(trunk);
        current = trunk;
      }
    }
  }

  grow() {
    // Process Leaves
    for (let l of this.leaves) {
      let closestBranch = null;
      let record = this.params.maxDist;
      for (let b of this.branches) {
        let d = l.pos.distanceTo(b.pos);
        if (d < this.params.minDist) {
          l.reached = true;
          closestBranch = null;
          break;
        } else if (d < record) {
          closestBranch = b;
          record = d;
        }
      }
      if (closestBranch != null) {
        closestBranch.dir.add(l.pos.clone().sub(closestBranch.pos).normalize());
        closestBranch.count++;
      }
    }

    this.leaves = this.leaves.filter((l) => !l.reached);

    // Process New Branches
    for (let i = this.branches.length - 1; i >= 0; i--) {
      let b = this.branches[i];
      
      if (b.count > 0) {
        // Only create if under limit
        if (this.branches.length < this.params.maxBranches) {
          b.dir.divideScalar(b.count + 1);
          b.dir.add(
            new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5)
            .multiplyScalar(0.1)
          ).normalize();
          
          let newB = new Branch(b, b.next(), b.dir, b.generation + 1, this.params);
          newB.mesh = createCylinderBetweenPoints(
            b.pos,
            newB.pos,
            b.radius,
            newB.radius,
            this.container,
            newB.generation,
            this.params
          );
          
          this.branches.push(newB);
        }
        b.reset();
      }
    }
    this.params.branchCount = this.branches.length;
    this.updateVisuals();
  }

  updateVisuals() {
    const pos = [];
    for (let l of this.leaves) pos.push(l.pos.x, l.pos.y, l.pos.z);
    this.leafGeometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    this.leafMaterial.color.set(this.params.leafColor);
  }
}
