import * as T from 'three';
import type { DemoSpec } from './types';
import { M } from '../lib/materials';
import { mesh, box, cyl, mount } from '../lib/geom';
import { Y0 } from './stage';

/** engine: the four strokes, one at a time */
export const engineDemo: DemoSpec = {
  dist: 3.2,
  steps: [
    'One cylinder, with the block cut away. The piston slides in the bore, and the connecting rod turns its up and down motion into rotation at the crankshaft below.',
    'Intake. The piston drops and the inlet valve opens, so the falling piston pulls in a mist of air and fuel, the way a syringe draws in liquid.',
    'Compression. Both valves shut and the piston rises, squeezing that mixture into about a tenth of its volume. Squeezing it makes it far more eager to burn.',
    'Power. The spark fires. The mixture burns and the pressure slams the piston down. This is the only stroke of the four that actually produces work.',
    'Exhaust. The piston comes back up, the exhaust valve opens, and the burnt gas is pushed out. Then it all begins again.',
    'Four strokes, two turns of the crankshaft, one push. A four cylinder engine staggers them so that one cylinder is always on its power stroke, which is what keeps the crank turning smoothly.'
  ],
  build(root) {
    const crankY = Y0 - .55, R = .3, L = .85;
    root.add(mesh(new T.CylinderGeometry(.3,.3,1.15,24,1,true), M.plastic(), 0,Y0+.55,0));
    root.add(mesh(cyl(.32,.1,24), M.dark(), 0,Y0+1.16,0));
    const piston = mesh(new T.CylinderGeometry(.27,.27,.26,24), M.steel(), 0,Y0+.5,0); root.add(piston);
    const rod = mesh(box(.075,L,.075), M.steel()); root.add(rod);
    const web = mesh(cyl(.26,.1,20), M.dark());
    web.add(mesh(box(.07,.12,.34), M.copper(), 0,.06,.15));   // counterweight marker
    root.add(mount(web, 0, crankY, 0, 'x'));
    const pin = mesh(cyl(.07,.16,10), M.copper()); pin.rotation.x = Math.PI/2; root.add(pin);
    const gas = mesh(new T.CylinderGeometry(.26,.26,.4,20), M.fluid(0x5aa6e0), 0,Y0+.9,0); root.add(gas);
    const vIn  = mesh(cyl(.05,.28,10), M.steel(), -.14,Y0+1.16,0); root.add(vIn);
    const vEx  = mesh(cyl(.05,.28,10), M.steel(),  .14,Y0+1.16,0); root.add(vEx);
    const plug = mesh(cyl(.04,.16,8), M.copper(), 0,Y0+1.24,0); root.add(plug);
    const COL = [0x5aa6e0, 0x9aa5ad, 0xff7a2f, 0x5f666c];
    return (dt, i, st)=>{
      const stroke = Math.max(0, Math.min(3, i-1));
      const p = Math.min(1, st/2.6);
      const th = (stroke + p) * Math.PI;
      const py = crankY + R*Math.cos(th) + Math.sqrt(L*L - Math.pow(R*Math.sin(th),2));
      piston.position.y = py;
      pin.position.set(R*Math.sin(th)*0, crankY + R*Math.cos(th), R*Math.sin(th));
      rod.position.set(0, (py + pin.position.y)/2, pin.position.z/2);
      rod.rotation.x = Math.atan2(pin.position.z, pin.position.y - py);
      web.rotation.y = th;
      const top = Y0 + 1.1, h = Math.max(.08, top - py - .13);
      gas.scale.y = h/.4; gas.position.y = py + .13 + h/2;
      (gas.material as T.MeshStandardMaterial).color.setHex(COL[stroke]);
      (gas.material as T.MeshStandardMaterial).emissive.setHex(stroke === 2 ? 0x883000 : 0x000000);
      (gas.material as T.MeshStandardMaterial).emissiveIntensity = stroke === 2 ? 1.2 * (1-p) : 0;
      vIn.position.y = Y0 + 1.16 - (stroke === 0 ? .09 : 0);
      vEx.position.y = Y0 + 1.16 - (stroke === 3 ? .09 : 0);
      (plug.material as T.MeshStandardMaterial).emissiveIntensity = (stroke === 2 && p < .12) ? 3 : .2;
    };
  }
};
