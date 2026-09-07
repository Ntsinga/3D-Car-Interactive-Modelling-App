import * as T from 'three';
import type { DemoSpec } from './types';
import { M } from '../lib/materials';
import { mesh, box, cyl, tube, mount, gearWheel } from '../lib/geom';
import { Y0 } from './stage';

/** steering: rotation into sideways push */
export const steeringDemo: DemoSpec = {
  dist: 3.4,
  steps: [
    'The steering, reduced to its three moving pieces: the wheel in your hands, a toothed bar called the rack, and the wheels at the corners.',
    'A small pinion gear on the end of the column sits in the teeth of the rack. Turn the wheel and the pinion walks itself along, dragging the rack sideways.',
    'A tie rod runs from each end of the rack to an arm behind each front wheel, so a few centimetres of sideways travel becomes the angle of the wheels.',
    'The two wheels do not turn by quite the same amount. The inner wheel goes through a tighter circle than the outer one, so the linkage is shaped to steer it a little harder.',
    'Roughly three turns of the wheel gives full lock. Fewer turns means quicker steering but heavier effort, which is the trade every steering rack is tuned around.'
  ],
  build(root) {
    const y = Y0;
    const col = new T.Group();
    const w = mesh(new T.TorusGeometry(.3,.045,10,26), M.rubber(), 0,0,0); col.add(w);
    for(let k=0;k<3;k++){ const a = k/3*Math.PI*2;
      col.add(mesh(box(.05,.05,.28), M.dark(), Math.sin(a)*.14,Math.cos(a)*.14,0)); }
    col.position.set(0, y+.75, -.5); root.add(col);
    root.add(mesh(cyl(.045,.7,10), M.steel(), 0,y+.4,-.32));
    const pinion = gearWheel(.16,10,.1, M.copper());
    root.add(mount(pinion, 0, y+.12, -.16, 'x'));
    const rack = new T.Group();
    rack.add(mesh(box(2.2,.11,.11), M.steel()));
    for(let k=0;k<22;k++) rack.add(mesh(box(.05,.07,.1), M.steel(), -1.05+k*.1,.08,0));
    rack.position.set(0,y+.05,0); root.add(rack);
    const hubs: T.Group[] = [];
    [-1,1].forEach(s=>{
      const h = new T.Group();
      const tyre = mesh(new T.CylinderGeometry(.34,.34,.18,22), M.rubber());
      tyre.rotation.z = Math.PI/2; h.add(tyre);
      h.add(mesh(box(.1,.08,.34), M.steel(), 0,0,-.2));      // steering arm
      h.position.set(s*1.35, y, .35); root.add(h); hubs.push(h);
    });
    const rods = [ tube([-1.05,y+.05,0],[-1.35,y,.15],.03,M.steel()),
                   tube([ 1.05,y+.05,0],[ 1.35,y,.15],.03,M.steel()) ];
    rods.forEach(r=> root.add(r));
    return (dt, i, st)=>{
      const amp = i >= 1 ? Math.sin(st*.9) : 0;
      col.rotation.z = -amp * 3.4;
      pinion.rotation.y = -amp * 3.4;
      rack.position.x = amp * .34;
      const inner = i >= 3 ? 1.3 : 1;                        // Ackermann exaggerated
      hubs[0].rotation.y = amp * .5 * (amp > 0 ? inner : 1);
      hubs[1].rotation.y = amp * .5 * (amp < 0 ? inner : 1);
      rods[0].position.x = -1.2 + amp*.17;
      rods[1].position.x =  1.2 + amp*.17;
    };
  }
};
