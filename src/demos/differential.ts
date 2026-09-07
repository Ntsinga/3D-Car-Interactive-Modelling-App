import * as T from 'three';
import type { DemoSpec } from './types';
import { M } from '../lib/materials';
import { mesh, box, cyl, mount, gearWheel } from '../lib/geom';
import { Y0 } from './stage';

/** differential: watch the locked axle skid, then fix it */
export const differentialDemo: DemoSpec = {
  dist: 6.2, phi: 0.95,
  steps: [
    'The differential, with its housing removed. Power comes in on the driveshaft, and its small pinion gear meets the big crown wheel, turning the drive through ninety degrees.',
    'Both rear wheels are joined to this one assembly. Driving straight, both cover the same ground, so both turn at the same speed and nothing complains.',
    'Now the same axle in a corner, seen from above. The two painted arcs are the paths the wheels must follow, and the outer one is clearly longer.',
    'This axle is locked: one solid shaft, both wheels forced to turn at exactly the same rate. Watch the inner wheel. It is being spun faster than its own shorter path allows, so it cannot roll cleanly. It judders and drags, and those black marks are rubber being scraped off the tyre.',
    'Now the differential is fitted. The inner wheel is allowed to slow down and the outer one to speed up, each rolling at exactly the rate its own arc needs. Same corner, same power, no marks on the ground.',
    'The rule it obeys is simple: whatever speed one wheel gains, the other gives up, so the two always average out to what the driveshaft delivers.',
    'That averaging is also its weakness. Lift one wheel or put it on ice and it spins freely while the other stops dead, because the easy path takes everything. That is the moment traction control steps in and brakes the spinning wheel.'
  ],
  build(root) {
    const y = Y0, GND = y - .52;

    /* the mechanism itself */
    const mech = new T.Group(); root.add(mech);
    const shaft = mesh(cyl(.06,1.1,12), M.steel(), 0,y,-.95); shaft.rotation.x = Math.PI/2; mech.add(shaft);
    const pin = gearWheel(.22,10,.14, M.steel());   mech.add(mount(pin, 0,y,-.42,'x'));
    const crown = gearWheel(.62,26,.16, M.copper()); mech.add(mount(crown, 0,y,0,'z'));
    const cage = mesh(new T.SphereGeometry(.34,18,12), M.plastic(), 0,y,0); mech.add(cage);
    const mHub: T.Group[] = [];
    [-1,1].forEach(s=>{
      const ax = mesh(cyl(.05,1.0,12), M.steel(), s*.85,y,0); ax.rotation.z = Math.PI/2; mech.add(ax);
      const sp = new T.Group();
      sp.add(mesh(new T.CylinderGeometry(.42,.42,.16,24), M.rubber()));
      for(let k=0;k<5;k++){ const a = k/5*Math.PI*2;
        sp.add(mesh(box(.06,.3,.06), M.steel(), 0, Math.cos(a)*.22, Math.sin(a)*.22)); }
      mech.add(mount(sp, s*1.38, y, 0, 'z')); mHub.push(sp);
    });

    /* the cornering rig, seen from above */
    const rig = new T.Group(); root.add(rig); rig.visible = false;
    const Ri = 1.5, Ro = 2.45, RW = .3, PX = -1.15;
    const pad = mesh(new T.CircleGeometry(3.1,48), M.dark(), PX,GND,0);
    pad.rotation.x = -Math.PI/2; rig.add(pad);
    [Ri,Ro].forEach(r=>{                                    // the two paths
      const t = mesh(new T.TorusGeometry(r,.012,6,72), M.lamp(), PX,GND+.01,0);
      t.rotation.x = Math.PI/2; rig.add(t);
    });
    rig.add(mesh(cyl(.05,.3,10), M.copper(), PX,GND+.15,0));  // turn centre
    const piv = new T.Group(); piv.position.set(PX,GND,0); rig.add(piv);
    piv.add(mesh(box(Ro-Ri+.3,.07,.16), M.steel(), (Ri+Ro)/2,RW,0));   // the axle beam
    piv.add(mesh(box(.5,.09,.7), M.paint(), (Ri+Ro)/2,RW+.1,0));       // a bit of car
    const rw: T.Group[] = [];
    [Ri,Ro].forEach(r=>{
      const sp = new T.Group();
      sp.add(mesh(new T.CylinderGeometry(RW,RW,.18,22), M.rubber()));
      for(let k=0;k<6;k++){ const a = k/6*Math.PI*2;
        sp.add(mesh(box(.05,.2,.05), M.lamp(), 0, Math.cos(a)*.19, Math.sin(a)*.19)); }
      piv.add(mount(sp, r, RW, 0, 'z')); rw.push(sp);
    });
    const marks: T.Mesh[] = [];                                        // rubber left on the road
    for(let k=0;k<70;k++){
      const m = mesh(new T.PlaneGeometry(.1,.16), new T.MeshBasicMaterial({color:0x0b0d10, transparent:true, opacity:.85}));
      m.rotation.x = -Math.PI/2; m.visible = false; m.castShadow = false; rig.add(m); marks.push(m);
    }
    let mi = 0, ang = 0, sIn = 0, sOut = 0, slip = 0, was = -1, base = 0;
    function reset(){ marks.forEach(m=> m.visible = false); mi = 0; ang = 0; sIn = sOut = slip = 0; }

    return (dt, i)=>{
      if(i !== was){ was = i; if(i === 2 || i === 3 || i === 4) reset(); }
      const onRig = i >= 2 && i <= 4;
      rig.visible = onRig; mech.visible = !onRig;

      if(!onRig){                                            // spin the gears
        base += dt*1.4;
        pin.rotation.y = base*2.4; crown.rotation.y = base; cage.rotation.z = base;
        mHub[0].rotation.y = base; mHub[1].rotation.y = base;
        return;
      }
      if(i === 2){ return; }                                 // hold still while the paths are explained

      const w = .42, da = dt*w;                              // sweep round the corner
      ang += da; piv.rotation.y = -ang;
      const dIn = Ri*da, dOut = Ro*da;                       // ground each wheel actually covers
      const locked = i === 3;
      const turnIn  = locked ? (dIn+dOut)/2 : dIn;           // what the wheel is forced to turn
      const turnOut = locked ? (dIn+dOut)/2 : dOut;
      sIn += turnIn/RW; sOut += turnOut/RW;
      rw[0].rotation.y = -sIn; rw[1].rotation.y = -sOut;

      if(locked){
        slip += Math.abs(turnIn - dIn);
        rw[0].position.x = (Math.random()-.5)*.02;           // the judder
        ((rw[0].children[0] as T.Mesh).material as T.MeshStandardMaterial).emissive.setRGB(.35,.05,0);
        if(slip > .07 && mi < marks.length){                 // scrub a mark onto the road
          slip = 0;
          const m = marks[mi++];
          m.position.set(PX + Ri*Math.cos(ang), GND+.012, Ri*Math.sin(ang));
          m.rotation.z = -ang; m.visible = true;
        }
      } else {
        rw[0].position.x = 0;
        ((rw[0].children[0] as T.Mesh).material as T.MeshStandardMaterial).emissive.setRGB(0,0,0);
      }
    };
  }
};
