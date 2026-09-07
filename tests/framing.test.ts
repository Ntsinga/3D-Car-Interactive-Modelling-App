import { describe, it, expect } from 'vitest';
import { distanceToFit, horizontalFov, MIN_DISTANCE, MAX_DISTANCE } from '../src/lib/framing';

const PHONE = 0.55;   // portrait, roughly 390x700 of stage
const DESKTOP = 1.7;
const FOV = 42;

describe('distanceToFit', () => {
  it('pulls back further on a narrow screen than a wide one', () => {
    const exhaustRadius = 1.63;
    expect(distanceToFit(exhaustRadius, FOV, PHONE))
      .toBeGreaterThan(distanceToFit(exhaustRadius, FOV, DESKTOP));
  });

  it('frames a long thin part far enough to fit it on a phone', () => {
    // The regression: the exhaust is 3.3 m long, so its bounding sphere is 1.63 m.
    // The old formula asked for 5.1 m and put the camera inside the part.
    expect(distanceToFit(1.63, FOV, PHONE)).toBeGreaterThan(6);
  });

  it('moves in close for a small part', () => {
    expect(distanceToFit(0.25, FOV, PHONE)).toBeLessThan(2.5);
  });

  it('scales linearly with the size of the part', () => {
    const a = distanceToFit(1, FOV, DESKTOP);
    const b = distanceToFit(2, FOV, DESKTOP);
    expect(b / a).toBeCloseTo(2, 5);
  });

  it('stays inside its clamps', () => {
    expect(distanceToFit(0.0001, FOV, PHONE)).toBe(MIN_DISTANCE);
    expect(distanceToFit(500, FOV, PHONE)).toBe(MAX_DISTANCE);
  });
});

describe('horizontalFov', () => {
  it('is narrower than vertical on a portrait screen', () => {
    const v = (FOV * Math.PI) / 180;
    expect(horizontalFov(v, PHONE)).toBeLessThan(v);
  });

  it('is wider than vertical on a landscape screen', () => {
    const v = (FOV * Math.PI) / 180;
    expect(horizontalFov(v, DESKTOP)).toBeGreaterThan(v);
  });
});
