import * as T from 'three';

/**
 * Every material is a factory, because each mesh gets its own clone: selection
 * tints the emissive channel per part, so they cannot be shared.
 *
 * Values assume `scene.environment` is set. Car paint reads as paint because it
 * has something to reflect, not because of its colour.
 */
export const M = {
  paint: () => new T.MeshPhysicalMaterial({
    color: 0x9e2d18, roughness: 0.32, metalness: 0.65,
    clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.5
  }),
  paint2: () => new T.MeshPhysicalMaterial({
    color: 0x8a2614, roughness: 0.34, metalness: 0.65,
    clearcoat: 1, clearcoatRoughness: 0.07, envMapIntensity: 1.4
  }),
  steel: () => new T.MeshStandardMaterial({
    color: 0x9aa3ad, roughness: 0.28, metalness: 0.95, envMapIntensity: 1.3
  }),
  dark: () => new T.MeshStandardMaterial({
    color: 0x32383f, roughness: 0.55, metalness: 0.55, envMapIntensity: 0.9
  }),
  rubber: () => new T.MeshStandardMaterial({
    color: 0x141619, roughness: 0.92, metalness: 0, envMapIntensity: 0.4
  }),
  engine: () => new T.MeshStandardMaterial({
    color: 0x6b7a88, roughness: 0.42, metalness: 0.75, envMapIntensity: 1.1
  }),
  copper: () => new T.MeshStandardMaterial({
    color: 0xa8703c, roughness: 0.36, metalness: 0.85, envMapIntensity: 1.2
  }),
  glass: () => new T.MeshPhysicalMaterial({
    color: 0x6f8f9c, roughness: 0.03, metalness: 0, transparent: true, opacity: 0.28,
    clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.2
  }),
  lamp: () => new T.MeshStandardMaterial({
    color: 0xfff6e0, emissive: 0xffd98a, emissiveIntensity: 0.5, roughness: 0.12, metalness: 0.2
  }),
  tail: () => new T.MeshStandardMaterial({
    color: 0xc0392b, emissive: 0x7a1610, emissiveIntensity: 0.45, roughness: 0.15, metalness: 0.2
  }),
  cloth: () => new T.MeshStandardMaterial({
    color: 0x3f444b, roughness: 0.98, metalness: 0, envMapIntensity: 0.35
  }),
  plastic: () => new T.MeshPhysicalMaterial({
    color: 0xc9d2d8, roughness: 0.25, metalness: 0, transparent: true, opacity: 0.42,
    clearcoat: 0.6, envMapIntensity: 1.2
  }),
  fluid: (c: number) => new T.MeshStandardMaterial({
    color: c, roughness: 0.08, metalness: 0.15, transparent: true, opacity: 0.9, envMapIntensity: 1.4
  })
};

/** Fluid colours, so a reservoir reads at a glance the way it does under a bonnet. */
export const FLUID = {
  brake: 0xd8c27a,
  steering: 0xc2543f,
  coolant: 0x6fd0a8,
  washer: 0x5aa6e0
};
