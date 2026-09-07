/**
 * The numbers behind the differential demo.
 *
 * Through a corner the outer wheel travels further than the inner one. A locked
 * axle forces both to turn at the same rate, so the inner tyre has to scrub the
 * difference off along the ground.
 */

export interface CornerSlip {
  /** Ground each wheel actually covers. */
  innerPath: number;
  outerPath: number;
  /** What a locked axle forces each wheel to roll. */
  lockedRoll: number;
  /** Ground the inner tyre must scrub, because it is rolled too far. */
  innerScrub: number;
  /** And the outer, which is rolled too little and drags the other way. */
  outerScrub: number;
}

export function cornerSlip(
  innerRadius: number,
  outerRadius: number,
  sweepRad: number
): CornerSlip {
  const innerPath = innerRadius * sweepRad;
  const outerPath = outerRadius * sweepRad;
  const lockedRoll = (innerPath + outerPath) / 2;
  return {
    innerPath,
    outerPath,
    lockedRoll,
    innerScrub: lockedRoll - innerPath,
    outerScrub: outerPath - lockedRoll
  };
}

/**
 * With a differential fitted the two wheels always average out to what the
 * driveshaft delivers: whatever one gains, the other gives up.
 */
export function averagesToInput(inner: number, outer: number, driveshaft: number): boolean {
  return Math.abs((inner + outer) / 2 - driveshaft) < 1e-9;
}
