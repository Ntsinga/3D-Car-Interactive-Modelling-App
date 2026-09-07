/** Battery, charging, ignition and wiring */

import * as T from 'three';
import { definePart } from './types';
import { M } from '../lib/materials';
import { mesh, box, cyl, tube, spins } from '../lib/geom';

export const alternator = definePart({
  id: 'alternator',
  name: 'Alternator',
  system: 'Electrics',
  explode: { dir: [0, 1, .4], dist: 1.7 },
  role: 'makes the electricity',
  info:
    'On the front of the engine, driven by the belt. It generates the electricity the car runs on and recharges the battery as you drive. The battery only starts the engine; after that this is doing the work.',
  detail: {
    madeOf: 'Aluminium case, copper windings, rectifier',
    attachesTo: 'Belt at the front, thick cable to the battery',
    worthKnowing: 'It puts out around 14 volts, deliberately higher than the battery, because that difference is what pushes charge back in.'
  },
  check:
    'If the battery light stays on while driving, or the headlights dim at idle and brighten when you rev, suspect this rather than the battery.',
  build(g) {
    const b = mesh(cyl(.1,.22,14), M.steel(), .3,.95,1.55);
    b.rotation.z = Math.PI/2; g.add(b);
    const pul = mesh(new T.CylinderGeometry(.07,.07,.04,14), M.dark(), .3,.95,1.68);
    pul.rotation.z = Math.PI/2; spins(pul, 2.6); g.add(pul);
    g.add(mesh(box(.08,.08,.06), M.copper(), .3,1.05,1.5));           // output stud
    g.add(tube([.3,1.05,1.5],[-.4,.95,1.75],.022,M.dark()));   // heavy cable to battery
  }
});

export const starter = definePart({
  id: 'starter',
  name: 'Starter motor',
  system: 'Electrics',
  explode: { dir: [0, -1, .2], dist: 1.6 },
  role: 'spins the engine to life',
  info:
    'A small very strong electric motor. Turning the key throws its gear into the ring on the edge of the flywheel and spins the whole engine over until it fires up on its own.',
  detail: {
    madeOf: 'Electric motor, solenoid, pinion gear',
    attachesTo: 'Bolts to the bellhousing, cable from the battery',
    worthKnowing: 'It draws more current than everything else in the car combined, but only for the second or two it runs.'
  },
  build(g) {
    const m = mesh(cyl(.09,.24,14), M.dark(), .28,.5,.92);
    m.rotation.z = Math.PI/2; g.add(m);
    g.add(mesh(cyl(.05,.12,12), M.steel(), .28,.5,.74));               // drive nose
    g.add(mesh(box(.06,.06,.06), M.copper(), .28,.6,.95));             // solenoid stud
    g.add(tube([.28,.6,.95],[-.42,.9,1.78],.026,M.dark()));   // cable from battery
  }
});

export const battery = definePart({
  id: 'battery',
  name: 'Battery',
  system: 'Electrics',
  explode: { dir: [0, 1, .5], dist: 1.6 },
  role: 'starts it, stores charge',
  info:
    'The heavy box in the corner of the engine bay. It holds just enough punch to spin the engine over; once running, the alternator takes over and puts the charge back. Slow cranking on a cold morning is it telling you it is tired.',
  detail: {
    madeOf: 'Lead plates in acid, 12 volts',
    attachesTo: 'Starter motor and every electrical circuit',
    worthKnowing: 'Cranking the engine pulls several hundred amps for a second or two.'
  },
  check:
    'Look for white or blue crust on the terminals and give each clamp a wiggle — it should not move at all. Slow, laboured cranking is the first warning.',
  build(g) {
    g.add(mesh(box(.34,.26,.26), M.dark(), -.5,.87,1.8));
    [-.06,.06].forEach(o=> g.add(mesh(cyl(.03,.06,8), M.copper(), -.5+o,1.02,1.8)));
  }
});

export const wiring = definePart({
  id: 'wiring',
  name: 'Wiring & fuse box',
  system: 'Electrics',
  explode: { dir: [0, 1, .2], dist: 1.6 },
  role: 'carries power everywhere',
  info:
    'A modern car carries over a kilometre of wire. Every circuit runs through a fuse designed to fail first, so a short burns a 20p part instead of the loom.',
  detail: {
    madeOf: 'Copper cores, plastic sheath, blade fuses',
    attachesTo: 'Battery to fuse box to every circuit',
    worthKnowing: 'Over a kilometre of wire, and the loom is often the heaviest single non-structural item in the car.'
  },
  check:
    'Learn where the fuse box is and read the lid — it maps every fuse. A single dead item, one window or one lamp, is a fuse before it is anything expensive.',
  build(g) {
    g.add(mesh(box(.18,.12,.22), M.dark(), -.66,.98,1.6));            // fuse box
    g.add(tube([-.62,.94,1.6],[-.5,.9,1.8],.022,M.dark()));            // to battery
    g.add(tube([-.66,.92,1.5],[-.3,.86,1.0],.028,M.dark()));           // main loom aft
    g.add(tube([-.3,.86,1.0],[0,.92,.84],.028,M.dark()));              // across the bulkhead
    g.add(tube([-.66,.96,1.72],[-.55,.9,2.1],.02,M.dark()));           // to the headlights
    g.add(tube([0,.9,.84],[-.85,.66,-.4],.022,M.dark()));              // down the sill
    g.add(tube([-.85,.66,-.4],[-.6,.6,-2.0],.022,M.dark()));   // to the tail lights
  }
});

export const lights = definePart({
  id: 'lights',
  name: 'Lights',
  system: 'Electrics',
  explode: { dir: [0, .2, 1], dist: 1.7 },
  role: 'see and be seen',
  info:
    'Headlights aimed slightly down and to the kerb side so you can see without dazzling oncoming drivers.',
  detail: {
    madeOf: 'Sealed housing, shaped reflector, LED or halogen',
    attachesTo: 'Wired to the battery through fuses',
    worthKnowing: 'The sharp cut-off at the top of the beam is what keeps oncoming drivers from being dazzled.'
  },
  check:
    'Walk round with the engine running and someone on the pedal, or reverse up to a window and use the reflection. A bulb out is the most common reason to get pulled over.',
  build(g) {
    [-.6,.6].forEach(x=>{ g.add(mesh(box(.36,.17,.07), M.lamp(), x,.87,2.19));
    g.add(mesh(box(.3,.15,.07), M.tail(), x,.88,-2.14)); });
  }
});

export const electricsParts = [alternator, starter, battery, wiring, lights];
