export class Branch {
  constructor(parent, pos, dir, generation = 0, params) {
    this.parent = parent;
    this.pos = pos.clone();
    this.dir = dir.clone();
    this.saveDir = dir.clone();
    this.count = 0;
    this.len = params.branchLen;
    this.generation = generation;
    this.radius = params.initialRadius * Math.pow(params.radiusDecay, generation);
    this.mesh = null;
  }

  reset() {
    this.count = 0;
    this.dir.copy(this.saveDir);
  }

  next() {
    let nextDir = this.dir.clone().multiplyScalar(this.len);
    let nextPos = this.pos.clone().add(nextDir);
    return nextPos;
  }
}
