/** Under the bonnet: intake, belts, cooling and fluids */

import * as T from 'three';
import { definePart } from './types';
import { M } from '../lib/materials';
import { mesh, box, cyl, tube, spins, bottle } from '../lib/geom';

export const airbox = definePart({
  id: 'airbox',
  name: 'Air intake & filter',
  system: 'Engine',
  explode: { dir: [0, 1, .4], dist: 1.7 },
  role: 'feeds the engine clean air',
  info:
    'The big plastic box on one side of the bay with a fat hose leaving it. An engine swallows about ten thousand litres of air for every litre of fuel, and this strains the grit out before it can score the cylinder walls.',
  detail: {
    madeOf: 'Plastic housing, pleated paper element',
    attachesTo: 'Snorkel at the front, hose to the throttle',
    worthKnowing: 'A blocked filter does not just cost power, it makes the engine run rich and waste fuel.'
  },
  check:
    'Unclip the box and hold the filter up to a light. If you cannot see light through it, replace it. Comparing it to a new one makes the difference obvious.',
  build(g) {
    g.add(mesh(box(.34,.2,.34), M.dark(), -.42,1.0,1.72));            // airbox
    g.add(mesh(box(.3,.03,.3), M.plastic(), -.42,1.06,1.72));         // filter element
    g.add(tube([-.42,1.0,1.55],[-.12,1.16,1.44],.055,M.rubber()));    // to the throttle
    g.add(tube([-.42,1.02,1.89],[-.55,.95,2.1],.05,M.dark()));   // cold air snorkel
  }
});

export const belt = definePart({
  id: 'belt',
  name: 'Serpentine belt',
  system: 'Engine',
  explode: { dir: [0, 1, .5], dist: 1.7 },
  role: 'drives everything up front',
  info:
    'One long rubber belt winding around every pulley on the front of the engine. It drives the alternator, the water pump and the power steering pump off the crankshaft. If it snaps you lose all of them at once.',
  detail: {
    madeOf: 'Ribbed rubber over cords of nylon or kevlar',
    attachesTo: 'Crankshaft, alternator, pump, tensioner',
    worthKnowing: 'A spring-loaded tensioner keeps it tight for life, which is why modern belts have no adjustment bolt.'
  },
  check:
    'Engine off. Look along the ribbed side for cracks, glazing or missing chunks, and press the longest run — more than about a centimetre of give means it needs tensioning.',
  build(g) {
    const path = [[0,.72,1.66],[.3,.95,1.66],[-.28,.62,1.66],[.12,1.02,1.66]];
    path.forEach((p,i)=>{ const nx = path[(i+1)%path.length];
    g.add(tube([p[0],p[1],1.72],[nx[0],nx[1],1.72],.022,M.rubber())); });
    const idl = mesh(new T.CylinderGeometry(.06,.06,.05,14), M.steel(), .12,1.02,1.66);
    idl.rotation.z = Math.PI/2; spins(idl, 3); g.add(idl);            // tensioner pulley
    g.add(mesh(box(.16,.06,.05), M.dark(), .2,1.06,1.66));   // tensioner arm
  }
});

export const ignition = definePart({
  id: 'ignition',
  name: 'Coils & spark plugs',
  system: 'Engine',
  explode: { dir: [0, 1, .2], dist: 1.7 },
  role: 'lights the fuel',
  info:
    'One coil sits on top of each spark plug. It turns twelve volts into tens of thousands, enough to jump the gap at the tip of the plug and light the fuel. A worn plug or a dead coil gives you a misfire you can feel through the seat.',
  detail: {
    madeOf: 'Coil pack, ceramic-insulated plug',
    attachesTo: 'One per cylinder, sitting in the head',
    worthKnowing: 'The spark is timed to a fraction of a degree of crank rotation, and fires slightly before the piston reaches the top.'
  },
  check:
    'A rough idle, a flashing engine light or a stumble under load is usually a coil or plug. Plugs are a service item with a mileage interval, not a lifetime part.',
  build(g) {
    [-.2,-.07,.07,.2].forEach(o=>{
    g.add(mesh(box(.07,.14,.1), M.dark(), o,1.22,1.05));            // coil body
    g.add(mesh(cyl(.02,.14,8), M.copper(), o,1.08,1.05));           // down to the plug
    g.add(mesh(box(.05,.03,.04), M.steel(), o,1.3,1.05)); });   // connector
  }
});

export const oilfilter = definePart({
  id: 'oilfilter',
  name: 'Oil filter',
  system: 'Engine',
  explode: { dir: [0, -1, .3], dist: 1.6 },
  role: 'keeps the oil clean',
  info:
    'Every drop of oil in the engine passes through this. It traps the metal and grit the oil picks up, which is why it gets replaced at every oil change rather than topped up.',
  detail: {
    madeOf: 'Pleated media in a can or cartridge',
    attachesTo: 'Screws onto the engine oil gallery',
    worthKnowing: 'It has a bypass valve inside, so if it ever clogs the engine still gets oil, dirty being better than none.'
  },
  check:
    'Nothing to check between services, but note where it is. On engines like this one it is a cartridge under a screw-off cap rather than a spin-on can.',
  build(g) {
    const can = mesh(new T.CylinderGeometry(.09,.09,.2,16), M.copper(), -.24,.58,1.05);
    g.add(can);
    g.add(mesh(new T.CylinderGeometry(.095,.095,.03,16), M.dark(), -.24,.7,1.05));
  }
});

export const ac = definePart({
  id: 'ac',
  name: 'Air conditioning',
  system: 'Cooling',
  explode: { dir: [0, .3, 1], dist: 1.9 },
  role: 'makes the cold air',
  info:
    'The compressor squeezes refrigerant gas until it is hot, the condenser in front of the radiator dumps that heat to the air, and letting the pressure go again makes it cold. Cold air is what is left over.',
  detail: {
    madeOf: 'Compressor, condenser, expansion valve, refrigerant',
    attachesTo: 'Belt-driven, condenser in front of the radiator',
    worthKnowing: 'It also dries the air, which is why the windscreen clears fastest with the AC on.'
  },
  check:
    'Run it for ten minutes once a month, even in winter. That keeps the seals oiled. Air that is cool rather than cold usually means the refrigerant is low.',
  build(g) {
    const cmp = mesh(cyl(.11,.2,14), M.dark(), -.3,.6,1.6);
    cmp.rotation.z = Math.PI/2; g.add(cmp);                            // compressor
    const cl = mesh(new T.CylinderGeometry(.08,.08,.04,14), M.steel(), -.3,.6,1.72);
    cl.rotation.z = Math.PI/2; spins(cl, 2.6); g.add(cl);              // clutch pulley
    g.add(mesh(box(.84,.5,.04), M.steel(), 0,.76,2.06));               // condenser
    for(let i=-5;i<=5;i++) g.add(mesh(box(.02,.44,.07), M.copper(), i*.07,.76,2.06));
    g.add(tube([-.3,.68,1.68],[-.35,.76,2.0],.028,M.steel()));         // hard lines
    g.add(tube([-.24,.55,1.6],[.3,.6,1.98],.028,M.steel()));
  }
});

export const radiator = definePart({
  id: 'radiator',
  name: 'Radiator',
  system: 'Cooling',
  explode: { dir: [0, .3, 1], dist: 1.9 },
  role: 'keeps the engine cool',
  info:
    'The tall finned panel right at the front, behind the grille. Hot coolant from the engine trickles through it while air rushes past, and the fan pulls air through when you are sitting still in traffic.',
  detail: {
    madeOf: 'Aluminium core, thin fins, plastic end tanks',
    attachesTo: 'Hoses to the engine, fan behind it',
    worthKnowing: 'Coolant runs well past 100 °C — the system is pressurised to raise its boiling point.'
  },
  check:
    'Never open a hot cap. Check the level in the plastic overflow bottle instead, and squeeze the top hose when cold — it should feel firm, not mushy or rock hard.',
  build(g) {
    g.add(mesh(box(.86,.56,.07), M.copper(), 0,.76,1.95));
    for(let i=-6;i<=6;i++) g.add(mesh(box(.02,.5,.1), M.dark(), i*.062,.76,1.95)); // fins
    g.add(mesh(box(.9,.07,.12), M.dark(), 0,1.06,1.95));            // top tank
    g.add(mesh(box(.9,.07,.12), M.dark(), 0,.46,1.95));             // bottom tank
    g.add(tube([.35,1.06,1.95],[.2,.95,1.6],.045,M.rubber()));      // hoses
    g.add(tube([-.35,.5,1.95],[-.2,.62,1.62],.045,M.rubber()));
    const fan = new T.Group();
    fan.add(mesh(cyl(.06,.08,12), M.dark()));
    for(let i=0;i<5;i++){ const a = i/5*Math.PI*2;
    const bl = mesh(box(.06,.03,.19), M.dark(), Math.cos(a)*.15,0,Math.sin(a)*.15);
    bl.rotation.y = -a; bl.rotation.z = .4; fan.add(bl); }
    fan.position.set(0,.76,1.83); fan.rotation.x = Math.PI/2;
    spins(fan, 3); g.add(fan);
  }
});

export const fluids = definePart({
  id: 'fluids',
  name: 'Coolant, oil & washer',
  system: 'Cooling',
  explode: { dir: [0, 1, .5], dist: 1.7 },
  role: 'the ones you top up',
  info:
    'The three you top up yourself. Coolant and washer fluid have their own bottles; engine oil goes straight into the engine through the yellow cap, and the dipstick tells you how much is in there.',
  detail: {
    madeOf: 'Plastic bottles, screw caps, dipstick',
    attachesTo: 'Coolant to radiator, washer to jets, oil into the engine',
    worthKnowing: 'Never open the coolant cap on a hot engine: the system is pressurised above boiling point and will spray scalding water.'
  },
  check:
    'Engine cold and parked level. Pull the dipstick, wipe it, push it fully back in, pull it again — the film should sit between the two marks. Coolant and washer you read straight off the side of the bottle.',
  build(g) {
    g.add(bottle(.17,.24,.17, .58,1.0,1.72, 0x6fd0a8, .04));          // coolant expansion tank
    g.add(tube([.5,.98,1.72],[.3,.95,1.9],.03,M.rubber()));            // to radiator top
    g.add(bottle(.2,.26,.18, -.62,.9,1.2, 0x5aa6e0, .04));             // screen washer
    g.add(tube([-.62,.95,1.11],[-.5,1.0,.95],.018,M.rubber()));
    g.add(mesh(cyl(.05,.06,12), M.copper(), .18,1.18,1.28));           // oil filler cap
    g.add(tube([.26,1.12,1.2],[.28,.7,1.15],.018,M.steel()));          // dipstick tube
    g.add(mesh(cyl(.014,.1,8), M.copper(), .26,1.2,1.2));   // dipstick handle
  }
});

export const enginebayParts = [airbox, belt, ignition, oilfilter, ac, radiator, fluids];
