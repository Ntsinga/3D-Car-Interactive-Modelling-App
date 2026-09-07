import * as T from 'three';

/** Renderer configured for physically-based output: sRGB, ACES tone mapping, soft shadows. */
export function createRenderer(stage: HTMLElement) {
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  stage.appendChild(renderer.domElement);
  return renderer;
}

export function createCamera() {
  return new T.PerspectiveCamera(42, 1, 0.1, 200);
}

/** Keeps the drawing buffer and projection matched to the stage element. */
export function fitToStage(
  renderer: T.WebGLRenderer,
  camera: T.PerspectiveCamera,
  stage: HTMLElement
) {
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
