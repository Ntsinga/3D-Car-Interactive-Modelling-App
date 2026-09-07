import type { DemoSpec } from './types';
import { M } from '../lib/materials';
import { mesh, cyl, mount, gearWheel } from '../lib/geom';
import { Y0 } from './stage';

/** gearbox: why a small gear driving a big one multiplies force */
export const gearboxDemo: DemoSpec = {
  dist: 3.6,
  steps: [
    'This is the gearbox with the casing taken off. Power arrives from the engine on the top shaft. It spins fast, but without much twisting force.',
    'Low gear. A small gear with fourteen teeth drives a big one with twenty eight. The big gear has twice as many teeth to get through, so it turns once for every two turns of the engine.',
    'Here is the trade. The output turns at half the speed, but with twice the twisting force. That doubled force is what gets a heavy car moving from a standstill.',
    'High gear. Now the pairing is reversed: the big gear drives the small one. The output spins twice as fast as the engine, but with half the force.',
    'That is the whole idea. Nothing creates power here. Each pair of gears simply trades speed for force, or force for speed, so the engine can stay in the narrow band of revs where it works best.'
  ],
  build(root) {
    const inY = Y0 + .45, outY = Y0 - .45;
    const s1 = mesh(cyl(.05,2.6,12), M.steel(), 0,inY,0); s1.rotation.z = Math.PI/2; root.add(s1);
    const s2 = mesh(cyl(.05,2.6,12), M.steel(), 0,outY,0); s2.rotation.z = Math.PI/2; root.add(s2);
    const A = gearWheel(.3,14,.16, M.steel());
    const B = gearWheel(.6,28,.16, M.copper());
    const C = gearWheel(.6,28,.16, M.copper());
    const D = gearWheel(.3,14,.16, M.steel());
    root.add(mount(A,-.62,inY,0,'z'), mount(B,-.62,outY,0,'z'),
             mount(C, .62,inY,0,'z'), mount(D, .62,outY,0,'z'));
    const collar = mesh(cyl(.13,.18,14), M.lamp(), 0,outY,0); collar.rotation.z = Math.PI/2; root.add(collar);
    let spin = 0, cx = 0;
    return (dt, i)=>{
      spin += dt * 1.7;
      const pair = i <= 2 ? (i >= 1 ? 1 : 0) : 2;      // 0 none, 1 low, 2 high
      const outRate = pair === 1 ? -.5 : pair === 2 ? -2 : 0;
      A.rotation.y = C.rotation.y = spin;
      const outSpin = spin * outRate;
      B.rotation.y = D.rotation.y = outSpin;
      const wantX = pair === 2 ? .62 : pair === 1 ? -.62 : 0;
      cx += (wantX - cx) * Math.min(1, dt*4); collar.position.x = cx;
    };
  }
};
