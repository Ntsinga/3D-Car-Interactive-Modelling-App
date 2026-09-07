/** Wheels, steering and brakes */

import * as T from 'three';
import { definePart } from './types';
import { M } from '../lib/materials';
import { mesh, box, cyl, tube, spins, bottle } from '../lib/geom';

function wheel(x: number, z: number): T.Group {
  const outer = new T.Group();
  const w = new T.Group();                       // everything that turns, axis = local Y
  w.add(mesh(new T.CylinderGeometry(.34,.34,.26,28), M.rubber()));
  for(let i=0;i<20;i++){                         // tread blocks
    const a = i/20*Math.PI*2;
    const b = mesh(box(.05,.27,.075), M.rubber(), Math.cos(a)*.345, 0, Math.sin(a)*.345);
    b.rotation.y = -a; w.add(b);
  }
  w.add(mesh(new T.CylinderGeometry(.21,.21,.28,20), M.steel()));   // rim barrel
  w.add(mesh(new T.CylinderGeometry(.2,.2,.06,20), M.dark(), 0,.13,0)); // outer lip
  for(let i=0;i<5;i++){                           // spokes
    const a = i/5*Math.PI*2;
    const s = mesh(box(.19,.06,.07), M.steel(), Math.cos(a)*.11,.1,Math.sin(a)*.11);
    s.rotation.y = -a; w.add(s);
    w.add(mesh(cyl(.017,.06,8), M.dark(), Math.cos(a)*.065,.15,Math.sin(a)*.065)); // lug nut
  }
  w.add(mesh(new T.CylinderGeometry(.075,.075,.3,14), M.dark()));   // hub
  w.add(mesh(new T.CylinderGeometry(.17,.17,.022,22), M.steel(), 0,-.06,0)); // brake disc
  spins(w);
  w.rotation.z = Math.PI/2; w.position.set(x,.34,z);
  outer.add(w);
  const cal = mesh(box(.09,.13,.11), M.copper(), x - Math.sign(x)*.03,.5,z-.05); // caliper, fixed
  outer.add(cal);
  return outer;
}

export const steering = definePart({
  id: 'steering',
  name: 'Steering rack & pump',
  system: 'Steering',
  explode: { dir: [0, -1, .4], dist: 1.7 },
  role: 'points the front wheels',
  info:
    'Turning the wheel rotates a pinion gear that slides the rack sideways. Tie rods push the wheels round. The pump adds hydraulic pressure so it stays light at parking speeds.',
  detail: {
    madeOf: 'Steel rack and pinion, hydraulic pump, tie rods',
    attachesTo: 'Column above, front uprights either side',
    worthKnowing: 'Fluid is red. It circulates constantly while the engine runs, which is why the pump whines on full lock.'
  },
  check:
    'Check the level cold, and listen on full lock. A groan or whine as you park is the classic low-fluid sound.',
  build(g) {
    const rack = mesh(cyl(.05,1.24,12), M.steel(), 0,.56,1.14);
    rack.rotation.z = Math.PI/2; g.add(rack);
    g.add(mesh(box(.16,.14,.16), M.dark(), .3,.6,1.14));               // pinion housing
    [-1,1].forEach(s=> g.add(tube([s*.6,.56,1.14],[s*.95,.5,1.33],.028,M.steel()))); // tie rods
    g.add(tube([.42,.86,.9],[.34,.64,1.1],.03,M.steel()));             // column to pinion
    const pump = mesh(cyl(.08,.14,12), M.steel(), -.3,.94,1.5);
    pump.rotation.z = Math.PI/2; g.add(pump);                          // belt-driven pump
    g.add(bottle(.13,.18,.13, -.48,1.02,1.55, 0xc2543f, .03));         // fluid reservoir
    g.add(tube([-.42,1.0,1.55],[-.3,.94,1.5],.022,M.rubber()));        // feed hose
    g.add(tube([-.3,.9,1.44],[-.1,.62,1.2],.022,M.rubber()));   // pressure hose
  }
});

export const brakes = definePart({
  id: 'brakes',
  name: 'Brake system',
  system: 'Brakes',
  explode: { dir: [0, 1, .3], dist: 1.8 },
  role: 'turns pedal push into stopping',
  info:
    'Pushing the pedal squeezes fluid down steel pipes to all four corners at once. Because liquid cannot be compressed, the force arrives instantly and evenly.',
  detail: {
    madeOf: 'Cast master cylinder, steel pipes, DOT 4 fluid',
    attachesTo: 'Pedal to all four wheels at once',
    worthKnowing: 'Brake fluid absorbs water from the air over time, which lowers its boiling point — that is why it is replaced every two years even if it looks fine.'
  },
  check:
    'Look at the level in the reservoir without opening it. A slow drop usually means the pads are wearing down, not a leak. Fluid that has gone dark instead of pale amber is due for a change.',
  build(g) {
    const boo = mesh(cyl(.16,.2,16), M.dark(), .45,.95,.86);
    boo.rotation.x = Math.PI/2; g.add(boo);                            // vacuum servo
    const mc = mesh(cyl(.06,.24,12), M.steel(), .45,.95,1.08);
    mc.rotation.x = Math.PI/2; g.add(mc);                              // master cylinder
    g.add(bottle(.15,.13,.17, .45,1.08,1.08, 0xd8c27a, .035));         // brake fluid
    g.add(tube([.45,.9,1.16],[.2,.5,1.2],.014,M.steel()));             // to the front pair
    [-1,1].forEach(s=> g.add(tube([.2,.5,1.2],[s*.86,.5,1.33],.014,M.steel())));
    g.add(tube([.45,.88,1.0],[.3,.44,.2],.014,M.steel()));             // down the tunnel
    g.add(tube([.3,.44,.2],[.2,.42,-1.2],.014,M.steel()));
    [-1,1].forEach(s=> g.add(tube([.2,.42,-1.2],[s*.7,.4,-1.35],.014,M.steel())));
  }
});

export const wheelsF = definePart({
  id: 'wheelsF',
  name: 'Front wheels',
  system: 'Wheels',
  explode: { dir: [0, 0, 1], dist: 1.6 },
  role: 'steers and grips',
  info:
    'The steered pair. The tyre contact patch is about the size of your hand — every bit of braking and cornering goes through it.',
  detail: {
    madeOf: 'Steel or alloy rim, rubber tyre',
    attachesTo: 'Hubs on the front suspension',
    worthKnowing: 'All four contact patches together are roughly the area of one sheet of A4 paper.'
  },
  check:
    'Push a coin into the tread grooves to judge depth, and check pressures cold against the sticker in the door frame. Uneven wear across the tyre points at alignment.',
  build(g) {
    [-.9,.9].forEach(x=> g.add(wheel(x,1.35)));
  }
});

export const wheelsR = definePart({
  id: 'wheelsR',
  name: 'Rear wheels',
  system: 'Wheels',
  explode: { dir: [0, 0, -1], dist: 1.6 },
  role: 'puts power on the road',
  info:
    'The driven pair on this layout: they push the car forward while the front wheels only steer.',
  detail: {
    madeOf: 'Same rim and tyre, driven hub',
    attachesTo: 'The ends of the rear axle',
    worthKnowing: 'Rear-wheel drive pushes the car along; front-wheel drive pulls it.'
  },
  check:
    'Same check as the front. Look for one edge wearing faster than the other, and for cracks in the sidewall on older tyres.',
  build(g) {
    [-.9,.9].forEach(x=> g.add(wheel(x,-1.35)));
  }
});

export const runningParts = [steering, brakes, wheelsF, wheelsR];
