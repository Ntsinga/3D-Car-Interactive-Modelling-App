import { describe, it, expect } from 'vitest';
import { Group, Box3, Vector3, Mesh } from 'three';
import { PARTS } from '../src/parts/registry';

/**
 * Builds every part for real. Geometry needs no WebGL context, so this runs in
 * Node and catches the class of mistake that used to reach the browser: a
 * builder that throws, a part built at the wrong scale, or one placed outside
 * the car entirely.
 */
function build(id: string) {
  const spec = PARTS.find(p => p.id === id)!;
  const g = new Group();
  spec.build(g);
  return g;
}

/** The car occupies roughly this envelope, in metres. */
const ENVELOPE = { x: 1.4, yMin: -0.1, yMax: 1.8, z: 2.6 };

describe('every part builds', () => {
  for (const spec of PARTS) {
    it(`${spec.id} builds without throwing and lands on the car`, () => {
      const g = build(spec.id);
      expect(g.children.length, 'produced no geometry').toBeGreaterThan(0);

      const bb = new Box3().setFromObject(g);
      const size = bb.getSize(new Vector3());
      expect(Number.isFinite(size.x) && Number.isFinite(size.y) && Number.isFinite(size.z)).toBe(true);
      expect(Math.min(size.x, size.y, size.z), 'degenerate geometry').toBeGreaterThan(0.001);

      expect(Math.abs(bb.min.x)).toBeLessThan(ENVELOPE.x);
      expect(Math.abs(bb.max.x)).toBeLessThan(ENVELOPE.x);
      expect(bb.min.y).toBeGreaterThan(ENVELOPE.yMin);
      expect(bb.max.y).toBeLessThan(ENVELOPE.yMax);
      expect(Math.abs(bb.min.z)).toBeLessThan(ENVELOPE.z);
      expect(Math.abs(bb.max.z)).toBeLessThan(ENVELOPE.z);
    });
  }

  it('gives the wheels the same radius front and rear', () => {
    const f = new Box3().setFromObject(build('wheelsF')).getSize(new Vector3());
    const r = new Box3().setFromObject(build('wheelsR')).getSize(new Vector3());
    expect(f.y).toBeCloseTo(r.y, 2);
  });

  it('sits the wheels on the ground', () => {
    const bb = new Box3().setFromObject(build('wheelsF'));
    expect(bb.min.y).toBeLessThan(0.05);
  });

  /**
   * The bug this guards: `g.add(mesh(...)).rotation.x = ...` sets the rotation on
   * the *group*, because add() returns the parent. It tipped a whole assembly on
   * its side and was invisible until rendered.
   */
  it('leaves every part group unrotated, so nothing was tipped by a chained add()', () => {
    for (const spec of PARTS) {
      const g = build(spec.id);
      expect(g.rotation.x, spec.id).toBe(0);
      expect(g.rotation.y, spec.id).toBe(0);
      expect(g.rotation.z, spec.id).toBe(0);
    }
  });

  it('marks spinning assemblies so inspect can turn them', () => {
    let spinners = 0;
    for (const spec of PARTS) {
      build(spec.id).traverse(o => { if (o.userData.spin) spinners++; });
    }
    expect(spinners).toBeGreaterThan(5);
  });

  it('gives every mesh a material', () => {
    for (const spec of PARTS) {
      build(spec.id).traverse(o => {
        const m = o as Mesh;
        if (m.isMesh) expect(m.material, spec.id).toBeTruthy();
      });
    }
  });
});
