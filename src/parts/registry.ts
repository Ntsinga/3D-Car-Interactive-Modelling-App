import type { PartSpec } from './types';
import { chassis, frontsus, floor } from './chassis';
import { rearaxle, engine, gearbox, driveshaft, exhaust, tank } from './drivetrain';
import { steering, brakes, wheelsF, wheelsR } from './running';
import { airbox, belt, ignition, oilfilter, ac, radiator, fluids } from './enginebay';
import { alternator, starter, battery, wiring, lights } from './electrics';
import { seats, dash } from './interior';
import { bodyF, bodyR, doors, hood, cabin, glass, bumpers } from './body';

/**
 * Assembly order: the order a car goes together on the line, and the order
 * Build mode enforces. Frame, axles, wheels, engine, driveline, then body.
 */
export const PARTS: PartSpec[] = [
  chassis,
  rearaxle,
  frontsus,
  steering,
  brakes,
  wheelsF,
  wheelsR,
  engine,
  airbox,
  alternator,
  belt,
  ignition,
  oilfilter,
  ac,
  starter,
  gearbox,
  driveshaft,
  exhaust,
  tank,
  radiator,
  fluids,
  battery,
  wiring,
  floor,
  seats,
  dash,
  bodyF,
  bodyR,
  doors,
  hood,
  cabin,
  glass,
  bumpers,
  lights,
];

export const partById = new Map(PARTS.map(p => [p.id, p]));
