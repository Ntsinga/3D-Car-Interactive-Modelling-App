import * as T from 'three';

/**
 * A small studio that exists only to be reflected.
 *
 * Car paint reads as paint because it mirrors softboxes and walls. Without an
 * environment map the same material looks like flat plastic, which is why this
 * does more for realism than any amount of extra geometry.
 */
export function buildEnvironment(renderer: T.WebGLRenderer): T.Texture {
  const es = new T.Scene();
  es.add(new T.Mesh(
    new T.BoxGeometry(20, 12, 20),
    new T.MeshBasicMaterial({ color: 0x2a3038, side: T.BackSide })
  ));

  const lamp = (w: number, h: number, d: number, x: number, y: number, z: number, c: number, i: number) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), new T.MeshBasicMaterial({ color: c }));
    m.position.set(x, y, z);
    m.material.color.multiplyScalar(i);
    es.add(m);
  };
  lamp(9, .2, 5, 0, 5.6, 0, 0xffffff, 2.4);      // main softbox overhead
  lamp(5, .2, 9, -3, 5.2, 0, 0xfff2e2, 1.5);
  lamp(.2, 4, 9, -8, 2.4, 0, 0xdce8ff, 1.1);     // cool wall either side
  lamp(.2, 4, 9, 8, 2.4, 0, 0xdce8ff, 1.1);
  lamp(9, 3, .2, 0, 1.8, -8, 0x9fb0c4, .5);      // dim back wall for edge definition
  lamp(14, .2, 14, 0, -4, 0, 0x11151a, 1);       // dark floor to sit in

  const pmrem = new T.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(es, 0.03).texture;
  es.traverse(o => {
    const m = o as T.Mesh;
    if (m.isMesh) { m.geometry.dispose(); (m.material as T.Material).dispose(); }
  });
  pmrem.dispose();
  return texture;
}
