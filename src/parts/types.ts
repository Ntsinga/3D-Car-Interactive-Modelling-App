import type { Group } from 'three';

export type System =
  | 'Structure' | 'Chassis' | 'Drivetrain' | 'Wheels' | 'Steering'
  | 'Brakes' | 'Engine' | 'Cooling' | 'Electrics' | 'Interior' | 'Body';

export interface PartDetail {
  madeOf: string;
  attachesTo: string;
  worthKnowing: string;
}

export interface PartSpec {
  id: string;
  name: string;
  system: System;
  /** Direction the part travels in the exploded view, and how far. */
  explode: { dir: [number, number, number]; dist: number };
  /** What it does, in a handful of words. */
  role: string;
  /** The explanation: where it is, then what it does. */
  info: string;
  detail: PartDetail;
  /** What an owner can check themselves. Omitted where there is nothing to check. */
  check?: string;
  /** Builds the geometry into the given group, in car coordinates. */
  build(g: Group): void;
}

/**
 * Everything a part carries lives in one object, so a part cannot be added with
 * its explanation missing — the compiler will not allow it. The previous version
 * kept these in five separate maps keyed by string, which silently drifted.
 */
export function definePart(spec: PartSpec): PartSpec {
  return spec;
}
