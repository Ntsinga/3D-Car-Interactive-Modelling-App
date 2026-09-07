import { describe, it, expect } from 'vitest';
import { PARTS, partById } from '../src/parts/registry';
import { DEMOS } from '../src/demos';

describe('part registry', () => {
  it('holds every part exactly once', () => {
    const ids = PARTS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(PARTS.length).toBe(34);
  });

  it('gives every part its explanation and reference facts', () => {
    for (const p of PARTS) {
      expect(p.name.length, p.id).toBeGreaterThan(2);
      expect(p.role.length, p.id).toBeGreaterThan(4);
      expect(p.info.length, p.id).toBeGreaterThan(40);
      expect(p.detail.madeOf.length, p.id).toBeGreaterThan(4);
      expect(p.detail.attachesTo.length, p.id).toBeGreaterThan(4);
      expect(p.detail.worthKnowing.length, p.id).toBeGreaterThan(20);
    }
  });

  it('starts with the chassis and ends with the body, as a car is assembled', () => {
    expect(PARTS[0].id).toBe('chassis');
    const order = PARTS.map(p => p.id);
    expect(order.indexOf('wheelsF')).toBeGreaterThan(order.indexOf('frontsus'));
    expect(order.indexOf('glass')).toBeGreaterThan(order.indexOf('cabin'));
    expect(order.indexOf('driveshaft')).toBeGreaterThan(order.indexOf('gearbox'));
  });

  it('explodes every part somewhere', () => {
    for (const p of PARTS) {
      const [x, y, z] = p.explode.dir;
      expect(Math.hypot(x, y, z), p.id).toBeGreaterThan(0);
      expect(p.explode.dist, p.id).toBeGreaterThan(0);
    }
  });

  it('points every demo at a part that exists', () => {
    for (const id of Object.keys(DEMOS)) expect(partById.has(id), id).toBe(true);
  });

  it('narrates every demo in several steps', () => {
    for (const [id, d] of Object.entries(DEMOS)) {
      expect(d.steps.length, id).toBeGreaterThanOrEqual(5);
      for (const s of d.steps) expect(s.length, id).toBeGreaterThan(60);
      expect(d.dist, id).toBeGreaterThan(1);
    }
  });
});
