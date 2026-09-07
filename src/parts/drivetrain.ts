/** Engine, gearbox and everything that carries power */

import * as T from 'three';
import { definePart } from './types';
import { M } from '../lib/materials';
import { mesh, box, cyl, tube, ring, spins } from '../lib/geom';

export const rearaxle = definePart({
  id: 'rearaxle',
  name: 'Rear axle & differential',
  system: 'Drivetrain',
  explode: { dir: [0, -1, -.35], dist: 1.7 },
  role: 'splits power between the wheels',
  info:
    'The differential turns the spinning driveshaft 90° and lets the two rear wheels rotate at different speeds through a corner.',
  detail: {
    madeOf: 'Cast housing, hardened steel gears',
    attachesTo: 'Driveshaft in, both rear wheels out',
    worthKnowing: 'Without a differential the inner wheel would scrub and skid through every corner.'
  },
  build(g) {
    [-1,1].forEach(s=>{                                             // axle tubes
    const t = mesh(cyl(.06,.68,12), M.steel(), s*.53,.36,-1.35);
    t.rotation.z = Math.PI/2; g.add(t);
    const drum = mesh(new T.CylinderGeometry(.15,.15,.09,16), M.dark(), s*.83,.36,-1.35);
    drum.rotation.z = Math.PI/2; g.add(drum);                      // brake drum
    g.add(tube([s*.62,.42,-1.35],[s*.62,.8,-1.02],.045,M.dark())); // spring seat link
    });
    g.add(mesh(new T.SphereGeometry(.2,18,14), M.dark(), 0,.36,-1.35));
    const cov = mesh(new T.CylinderGeometry(.17,.17,.06,18), M.steel(), 0,.36,-1.55);
    cov.rotation.x = Math.PI/2; g.add(cov);                          // diff cover
    const nose = mesh(new T.CylinderGeometry(.07,.1,.22,12), M.steel(), 0,.38,-1.16);
    nose.rotation.x = Math.PI/2; g.add(nose);                        // pinion nose
    const fl = mesh(new T.CylinderGeometry(.085,.085,.035,16), M.steel(), 0,.38,-1.06);
    fl.rotation.x = Math.PI/2; spins(fl, 1.4); g.add(fl);
  }
});

export const engine = definePart({
  id: 'engine',
  name: 'Engine',
  system: 'Drivetrain',
  explode: { dir: [0, 1, .55], dist: 1.9 },
  role: 'makes the power',
  info:
    'The big block in the middle of everything. Inside, four pistons slide up and down in their bores; each controlled explosion shoves one down, and the crankshaft turns that up-and-down into the rotation that drives the wheels.',
  detail: {
    madeOf: 'Aluminium block, steel crankshaft',
    attachesTo: 'Sits on the chassis, feeds the gearbox',
    worthKnowing: 'At 3000 rpm each cylinder fires about 25 times every second.'
  },
  build(g) {
    g.add(mesh(box(.62,.5,.72), M.engine(), 0,.75,1.28));            // block
    g.add(mesh(box(.56,.18,.66), M.dark(), 0,1.06,1.28));            // head
    g.add(mesh(box(.5,.14,.3), M.copper(), 0,1.2,1.42));             // intake
    [-.2,-.07,.07,.2].forEach(o=> g.add(mesh(cyl(.035,.26,8), M.steel(), o,1.22,1.15)));
    g.add(mesh(box(.5,.16,.6), M.steel(), 0,.46,1.28));              // oil sump
    const pul = mesh(new T.CylinderGeometry(.13,.13,.05,18), M.steel(), 0,.72,1.66);
    pul.rotation.x = Math.PI/2; spins(pul, 2); g.add(pul);           // crank pulley
    const belt = ring(.16,.018, M.rubber()); belt.position.set(0,.8,1.68); g.add(belt);
    [-.18,-.06,.06,.18].forEach(o=>                                  // exhaust manifold
    g.add(tube([o,1.0,.98],[o*.4,.78,.9],.032,M.steel())));
    g.add(tube([-.07,.78,.9],[-.3,.7,.95],.05,M.steel()));
  }
});

export const gearbox = definePart({
  id: 'gearbox',
  name: 'Gearbox',
  system: 'Drivetrain',
  explode: { dir: [0, 1, -.15], dist: 1.9 },
  role: 'matches power to speed',
  info:
    'Pairs of gears with different tooth counts. A small gear driving a big one makes the output turn slower but push harder; reverse the pair and you get speed instead. Tap See how it works to watch it.',
  detail: {
    madeOf: 'Hardened steel gear pairs running in oil',
    attachesTo: 'Engine ahead of it, driveshaft behind',
    worthKnowing: 'First gear multiplies the engine\u2019s turning force three to four times over.'
  },
  build(g) {
    const bell = mesh(new T.CylinderGeometry(.29,.2,.3,16), M.engine(), 0,.62,.78);
    bell.rotation.x = -Math.PI/2; g.add(bell);                       // bell housing
    const cas = mesh(new T.CylinderGeometry(.2,.15,.75,14), M.engine(), 0,.6,.28);
    cas.rotation.x = Math.PI/2; g.add(cas);                          // main casing
    [.5,.32,.14].forEach(z=>{ const r = ring(.18,.018, M.dark());
    r.position.set(0,.6,z); r.rotation.y = Math.PI/2; r.rotation.z = Math.PI/2; g.add(r); });
    g.add(mesh(cyl(.025,.28,8), M.dark(), 0,.86,.55));               // shifter
    g.add(mesh(new T.SphereGeometry(.05,10,8), M.rubber(), 0,1.0,.55));
    g.add(mesh(new T.CylinderGeometry(.085,.085,.04,14), M.steel(), 0,.58,-.12));
  }
});

export const driveshaft = definePart({
  id: 'driveshaft',
  name: 'Driveshaft',
  system: 'Drivetrain',
  explode: { dir: [0, -1, 0], dist: 1.9 },
  role: 'carries power rearwards',
  info:
    'A spinning steel tube carrying power from the gearbox back to the differential. The universal joint at each end is what lets it keep driving while the axle moves up and down.',
  detail: {
    madeOf: 'Thin-wall steel tube with universal joints',
    attachesTo: 'Gearbox output to the differential',
    worthKnowing: 'It spins faster than the wheels do — the differential gears it back down.'
  },
  build(g) {
    const a = new T.Vector3(0,.42,.15), b = new T.Vector3(0,.38,-1.3);
    const dir = b.clone().sub(a), len = dir.length();
    const sh = new T.Group();                    // spins about its own long axis
    sh.add(mesh(cyl(.05, len-.26, 14), M.steel()));
    [-1,1].forEach(s=>{
    const y = s*(len/2-.1);
    const c1 = mesh(cyl(.028,.17,8), M.dark(), 0,y,0);   // cross pin, one way
    c1.rotation.z = Math.PI/2; sh.add(c1);
    const c2 = mesh(cyl(.028,.17,8), M.dark(), 0,y,0);   // cross pin, the other
    c2.rotation.x = Math.PI/2; sh.add(c2);
    sh.add(mesh(new T.CylinderGeometry(.085,.085,.035,16), M.steel(), 0,s*(len/2-.02),0));
    sh.add(mesh(box(.13,.1,.05), M.steel(), 0,y+s*.06,0)); // yoke arm
    });
    sh.position.copy(a).add(b).multiplyScalar(.5);
    sh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0), dir.clone().normalize());
    spins(sh, 1.4); g.add(sh);
    const brg = ring(.085,.022, M.dark()); brg.position.set(0,.4,-.55);
    brg.rotation.y = Math.PI/2; brg.rotation.z = Math.PI/2; g.add(brg);
  }
});

export const exhaust = definePart({
  id: 'exhaust',
  name: 'Exhaust system',
  system: 'Drivetrain',
  explode: { dir: [0, -1, -.5], dist: 1.9 },
  role: 'clears and quiets the gases',
  info:
    'Carries burnt gases out the back. The catalytic converter cleans them and the muffler cancels sound waves against each other.',
  detail: {
    madeOf: 'Steel pipe, ceramic catalyst, baffled muffler',
    attachesTo: 'Engine head to the tail of the car',
    worthKnowing: 'The catalyst only works hot, so most of a journey\u2019s emissions come out in the first minute.'
  },
  build(g) {
    g.add(tube([-.3,.28,1.05],[-.3,.24,-1.5],.05,M.dark()));
    const cat = mesh(cyl(.1,.4,12), M.steel(), -.3,.26,.3); cat.rotation.x = Math.PI/2; g.add(cat);
    const muf = mesh(box(.34,.16,.5), M.steel(), -.3,.26,-1.72); g.add(muf);
    g.add(tube([-.3,.26,-1.95],[-.3,.3,-2.2],.045,M.steel()));
  }
});

export const tank = definePart({
  id: 'tank',
  name: 'Fuel tank',
  system: 'Drivetrain',
  explode: { dir: [0, -1, -.5], dist: 1.6 },
  role: 'stores the fuel',
  info:
    'Slung under the floor between the axles, where its weight barely changes the handling as it empties. The pump lives inside it, sitting in the fuel that keeps it cool.',
  detail: {
    madeOf: 'Moulded plastic or steel, around 50 litres',
    attachesTo: 'Fuel line and pump to the engine',
    worthKnowing: 'Petrol weighs about 0.75 kg a litre, so a full tank is like carrying a child.'
  },
  build(g) {
    g.add(mesh(box(.95,.28,.62), M.dark(), 0,.5,-.95));
  }
});

export const drivetrainParts = [rearaxle, engine, gearbox, driveshaft, exhaust, tank];
