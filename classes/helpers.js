import * as THREE from 'three';

export function createCylinderBetweenPoints(startPoint, endPoint, startRadius, endRadius, container, generation, params) {
  const direction = endPoint.clone().sub(startPoint);
  const length = direction.length();
  const geometry = new THREE.CylinderGeometry(startRadius, endRadius, length, 8);

  let color;
  if (generation === 0) {
    color = new THREE.Color(0x00ff00);
  } else {
    const t = Math.min(generation / 80, 0.8);
    color = new THREE.Color(params.trunkColor).lerp(new THREE.Color(0x00ff00), t);
  }

  const material = new THREE.MeshPhongMaterial({
    color: color,
    shininess: 40,
    emissive: generation === 0 ? 0x00ff00 : 0x000000,
    emissiveIntensity: generation === 0 ? 0.3 : 0,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(startPoint.clone().add(endPoint).multiplyScalar(0.5));
  direction.normalize();
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  container.add(mesh);
  return mesh;
}
