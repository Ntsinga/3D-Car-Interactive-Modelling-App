import type { DemoSpec } from './types';
import { gearboxDemo } from './gearbox';
import { engineDemo } from './engine';
import { brakesDemo } from './brakes';
import { differentialDemo } from './differential';
import { steeringDemo } from './steering';

/** Keyed by part id: a part shows "See how it works" only if it has one. */
export const DEMOS: Record<string, DemoSpec> = {
  gearbox: gearboxDemo,
  engine: engineDemo,
  brakes: brakesDemo,
  rearaxle: differentialDemo,
  steering: steeringDemo
};

export type { DemoSpec, DemoUpdate } from './types';
