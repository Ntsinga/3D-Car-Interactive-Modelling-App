import type { Group } from 'three';

/**
 * A demo is a stripped-down working model of one mechanism: the part with its
 * casing off, animated, narrated a step at a time.
 *
 * `update` is called every frame with the time delta, the current step index and
 * how long that step has been on screen, so a demo can drive its animation from
 * the narration rather than looping independently of it.
 */
export type DemoUpdate = (dt: number, step: number, stepTime: number) => void;

export interface DemoSpec {
  /** Camera distance that frames the whole rig. */
  dist: number;
  /** Optional camera elevation, for demos better read from above. */
  phi?: number;
  /** One spoken paragraph per step. */
  steps: string[];
  build(root: Group): DemoUpdate;
}
