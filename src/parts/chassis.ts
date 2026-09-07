/** Frame, floor and suspension */

import * as T from 'three';
import { definePart } from './types';
import { M } from '../lib/materials';
import { mesh, box, cyl, tube, ring } from '../lib/geom';

export const chassis = definePart({
  id: 'chassis',
  name: 'Chassis frame',
  system: 'Structure',
  explode: { dir: [0, -1, 0], dist: 1.5 },
  role: 'holds everything together',
  info:
    'Two steel rails joined by crossmembers. Everything else bolts to this, and it takes the twisting loads so the body panels never have to.',
  detail: {
    madeOf: 'Boxed steel rails, 2–3 mm wall',
    attachesTo: 'Everything bolts to it',
    worthKnowing: 'On most modern cars this is welded into the body itself, called a unibody.'
  },
  build(g) {
    [-.55,.55].forEach(x=>g.add(mesh(box(.13,.17,4.05), M.steel(), x,.36,-.05)));
    [1.62,.45,-.85,-1.92].forEach(z=>g.add(mesh(box(1.12,.11,.15), M.steel(), 0,.36,z)));
    g.add(mesh(box(.9,.1,.12), M.dark(), 0,.55,2.05));
  }
});

export const frontsus = definePart({
  id: 'frontsus',
  name: 'Front suspension',
  system: 'Chassis',
  explode: { dir: [0, -1, .4], dist: 1.7 },
  role: 'soaks up the bumps',
  info:
    'Springs and dampers let each wheel move over bumps while the body stays level. The control arms hold the wheel at the right angle as it travels.',
  detail: {
    madeOf: 'Coil springs, oil-filled dampers, steel arms',
    attachesTo: 'Chassis to the front hubs',
    worthKnowing: 'The spring carries the weight; the damper is what stops the car bouncing afterwards.'
  },
  build(g) {
    [-.7,.7].forEach(x=>{
    for(let i=0;i<7;i++){                     // coil spring, ring by ring
    const c = ring(.085,.016, M.copper());
    c.position.set(x,.44+i*.052,1.35); c.rotation.x = Math.PI/2; g.add(c);
    }
    g.add(mesh(cyl(.022,.42,10), M.steel(), x,.62,1.35));      // damper rod
    g.add(mesh(cyl(.05,.2,12), M.dark(), x,.46,1.35));          // damper body
    g.add(mesh(new T.CylinderGeometry(.09,.09,.035,14), M.dark(), x,.83,1.35)); // top mount
    g.add(tube([x*.3,.36,1.35],[x*.97,.4,1.35],.038,M.steel())); // lower arm
    g.add(tube([x*.35,.34,1.15],[x*.97,.4,1.35],.03,M.steel())); // trailing link
    g.add(mesh(box(.07,.3,.12), M.dark(), x*1.02,.48,1.35));     // upright
    });
  }
});

export const floor = definePart({
  id: 'floor',
  name: 'Floor pan',
  system: 'Structure',
  explode: { dir: [0, -1, 0], dist: 1.3 },
  role: 'seals and stiffens the cabin',
  info:
    'The stamped steel floor and door sills. It seals the cabin from the road and stiffens the whole middle of the car.',
  detail: {
    madeOf: 'Stamped steel panels, spot-welded together',
    attachesTo: 'Sits on the chassis, carries the seats',
    worthKnowing: 'The ridges pressed into the metal are there for stiffness, not decoration.'
  },
  build(g) {
    g.add(mesh(box(1.76,.07,2.5), M.paint2(), 0,.5,0));
    [-.88,.88].forEach(x=> g.add(mesh(box(.12,.3,2.5), M.paint2(), x,.62,0)));
  }
});

export const chassisParts = [chassis, frontsus, floor];
