import * as T from 'three';
import type { DemoSpec } from './types';
import { M } from '../lib/materials';
import { mesh, box, cyl, mount } from '../lib/geom';
import { Y0 } from './stage';

/** brakes: force multiplied through a liquid */
export const brakesDemo: DemoSpec = {
  dist: 3.8,
  steps: [
    'The brake system, straightened out. Your foot is on the left, the wheel is on the right, and a sealed column of fluid joins them.',
    'You press the pedal. The pedal is a lever, so a light push at the top becomes a much harder shove at the master cylinder.',
    'That shove drives a piston into the fluid. A liquid cannot be squashed, so the fluid has nowhere to go except down the pipe, and the push arrives at the far end instantly.',
    'The piston at the wheel is much fatter than the one at the pedal. Spread the same pressure over a bigger area and you get a bigger force, so the pads clamp far harder than your foot ever pushed.',
    'The pads grip the spinning disc and the car slows. The energy does not vanish, it becomes heat: hard braking can take a disc past four hundred degrees.'
  ],
  build(root) {
    const y = Y0;
    const pedal = new T.Group();
    pedal.add(mesh(box(.09,.62,.16), M.steel(), 0,-.31,0));
    pedal.add(mesh(box(.16,.16,.2), M.rubber(), 0,-.62,0));
    pedal.position.set(-1.5, y+.45, 0); root.add(pedal);
    const rodP = mesh(box(.3,.06,.06), M.steel(), -1.28,y+.1,0); root.add(rodP);
    root.add(mesh(box(.5,.26,.26), M.dark(), -.95,y+.1,0));           // master cylinder body
    const mPis = mesh(box(.1,.2,.2), M.copper(), -1.1,y+.1,0); root.add(mPis);
    root.add(mesh(box(1.5,.1,.1), M.plastic(), .05,y+.1,0));          // the pipe
    const dots: T.Mesh[] = [];
    for(let k=0;k<9;k++){ const s = mesh(new T.SphereGeometry(.04,10,8), M.fluid(0xd8c27a), -.65+k*.19, y+.1, 0);
      root.add(s); dots.push(s); }
    const disc = mesh(new T.CylinderGeometry(.55,.55,.05,32), M.steel());
    for(let k=0;k<6;k++){ const a = k/6*Math.PI*2;
      disc.add(mesh(cyl(.05,.06,10), M.dark(), Math.cos(a)*.3,0,Math.sin(a)*.3)); }  // cooling holes
    root.add(mount(disc, 1.25, y+.1, 0, 'x'));
    const padA = mesh(box(.1,.3,.06), M.copper(), 1.25,y+.1,-.16); root.add(padA);
    const padB = mesh(box(.1,.3,.06), M.copper(), 1.25,y+.1, .16); root.add(padB);
    let w = 3.2;
    return (dt, i, st)=>{
      const press = i >= 2 ? Math.min(1, st/1.2) : 0;
      pedal.rotation.z = -press * .34;
      rodP.position.x = -1.28 + press*.09;
      mPis.position.x = -1.1 + press*.1;
      dots.forEach((s,k)=> s.position.x = -.65 + k*.19 + press*.07);
      const clamp = i >= 3 ? Math.min(1, st/1.2) : 0;
      padA.position.z = -.16 + clamp*.1; padB.position.z = .16 - clamp*.1;
      if(i >= 4) w = Math.max(0, w - dt*1.6*clamp); else w = 3.2;
      disc.rotation.y += w*dt;
      (padA.material as T.MeshStandardMaterial).emissive.setHex(0x000000);
      if(i >= 4){ const heat = 1 - w/3.2;
        (padA.material as T.MeshStandardMaterial).emissive.setRGB(heat*.5,0,0); (padB.material as T.MeshStandardMaterial).emissive.setRGB(heat*.5,0,0); }
    };
  }
};
