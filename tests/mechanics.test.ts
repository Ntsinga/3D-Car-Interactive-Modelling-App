import { describe, it, expect } from 'vitest';
import { packColumn, gapFor, isTiny, TOP_MARGIN, BOTTOM_MARGIN } from '../src/lib/layout';
import { crankPose, stroke } from '../src/lib/kinematics';
import { cornerSlip, averagesToInput } from '../src/lib/cornering';

describe('label packing', () => {
  const STAGE = 420;

  it('never overlaps labels', () => {
    const ys = [100, 105, 108, 110, 112, 300, 302, 305];
    const slots = packColumn(ys, STAGE);
    const gap = gapFor(ys.length, STAGE);
    for (let i = 1; i < slots.length; i++) {
      expect(slots[i].labelY - slots[i - 1].labelY).toBeGreaterThanOrEqual(gap - 1e-9);
    }
  });

  it('keeps every label on screen, even when crowded', () => {
    const ys = Array.from({ length: 17 }, (_, i) => 60 + i * 3);  // all bunched together
    const slots = packColumn(ys, STAGE);
    for (const s of slots) {
      expect(s.labelY).toBeGreaterThanOrEqual(TOP_MARGIN - 1e-9);
      expect(s.labelY).toBeLessThanOrEqual(STAGE - BOTTOM_MARGIN + 1e-9);
    }
  });

  it('fits all 34 parts split across two columns', () => {
    const perColumn = 17;
    const slots = packColumn(Array.from({ length: perColumn }, (_, i) => i * 20), STAGE);
    expect(slots).toHaveLength(perColumn);
    expect(slots[perColumn - 1].labelY).toBeLessThanOrEqual(STAGE - BOTTOM_MARGIN);
  });

  it('shrinks the type only once spacing gets tight', () => {
    expect(isTiny(4, STAGE)).toBe(false);
    expect(isTiny(30, STAGE)).toBe(true);
  });

  it('leaves a single label alone', () => {
    const slots = packColumn([200], STAGE);
    expect(slots[0].labelY).toBe(200);
  });
});

describe('slider-crank', () => {
  const R = 0.3, L = 0.85;

  it('holds the connecting rod at a constant length through two revolutions', () => {
    for (let deg = 0; deg < 720; deg += 3) {
      const p = crankPose((deg * Math.PI) / 180, R, L);
      const len = Math.hypot(p.pistonY - p.pinY, p.pinZ);
      expect(len).toBeCloseTo(L, 10);
    }
  });

  it('puts top dead centre at rod plus crank, and bottom at rod minus crank', () => {
    expect(crankPose(0, R, L).pistonY).toBeCloseTo(L + R, 10);
    expect(crankPose(Math.PI, R, L).pistonY).toBeCloseTo(L - R, 10);
  });

  it('travels one stroke between them', () => {
    const top = crankPose(0, R, L).pistonY;
    const bottom = crankPose(Math.PI, R, L).pistonY;
    expect(top - bottom).toBeCloseTo(stroke(R), 10);
  });
});

describe('cornering', () => {
  it('makes the outer wheel travel further than the inner', () => {
    const s = cornerSlip(1.5, 2.45, Math.PI / 2);
    expect(s.outerPath).toBeGreaterThan(s.innerPath);
  });

  it('forces the inner tyre to scrub when the axle is locked', () => {
    const s = cornerSlip(1.5, 2.45, Math.PI / 2);
    expect(s.innerScrub).toBeGreaterThan(0.7);          // ~0.75 m per quarter turn
    expect(s.innerScrub).toBeCloseTo(s.outerScrub, 10); // one over-rolls as the other under-rolls
  });

  it('scrubs nothing when the two paths are the same length', () => {
    const s = cornerSlip(2, 2, Math.PI / 2);
    expect(s.innerScrub).toBeCloseTo(0, 12);
  });

  it('averages the two wheels back to the driveshaft', () => {
    const s = cornerSlip(1.5, 2.45, 1);
    expect(averagesToInput(s.innerPath, s.outerPath, s.lockedRoll)).toBe(true);
  });
});
