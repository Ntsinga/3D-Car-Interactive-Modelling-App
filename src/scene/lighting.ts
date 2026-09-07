import * as T from 'three';

/**
 * Direct light is deliberately restrained: most of the illumination comes from
 * the environment map, and these are here for shape and a readable shadow.
 */
export function addLighting(scene: T.Scene) {
  scene.add(new T.HemisphereLight(0x9fb6cc, 0x141619, 0.35));

  const key = new T.DirectionalLight(0xfff0dd, 0.85);
  key.position.set(5, 8, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0006;
  const d = 6;
  Object.assign(key.shadow.camera, { left: -d, right: d, top: d, bottom: -d, near: 1, far: 26 });
  scene.add(key);

  const rim = new T.DirectionalLight(0x7fb4c8, 0.3);
  rim.position.set(-6, 3, -5);
  scene.add(rim);

  /** Rides with the camera during inspect, so dark thin parts stay visible up close. */
  const inspect = new T.PointLight(0xfff4e2, 1.5, 14, 1.6);
  inspect.visible = false;
  scene.add(inspect);

  return { key, rim, inspect };
}

export function addGround(scene: T.Scene) {
  const floor = new T.Mesh(
    new T.CircleGeometry(9, 64),
    new T.MeshStandardMaterial({ color: 0x171b20, roughness: 0.45, metalness: 0.25, envMapIntensity: 0.6 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.001;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new T.GridHelper(18, 18, 0x39424c, 0x272d35);
  (grid.material as T.Material).transparent = true;
  (grid.material as T.Material).opacity = 0.5;
  scene.add(grid);
  return { floor, grid };
}
