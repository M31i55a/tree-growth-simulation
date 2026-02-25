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

  // Create wireframe mesh for animation
  const wireframeGeometry = geometry.clone();
  const wireframeMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color(0x00ff88),
    shininess: 40,
    wireframe: true,
    wireframeLinewidth: 0.1,
    emissive: generation === 0 ? 0x00ff88 : 0x000000,
    emissiveIntensity: generation === 0 ? 0.3 : 0,
  });
  
  const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
  const mesh = new THREE.Mesh(geometry, material);
  
  // Position and orient both meshes
  const midpoint = startPoint.clone().add(endPoint).multiplyScalar(0.5);
  mesh.position.copy(midpoint);
  wireframeMesh.position.copy(midpoint);
  
  direction.normalize();
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  mesh.quaternion.copy(quaternion);
  wireframeMesh.quaternion.copy(quaternion);
  
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  mesh.userData.createdAt = Date.now();
  wireframeMesh.userData.createdAt = Date.now();
  wireframeMesh.userData.isWireframe = true;
  mesh.userData.isWireframe = false;

  container.add(wireframeMesh);
  container.add(mesh);
  
  return { mesh, wireframeMesh };
}
