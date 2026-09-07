# Car build bay

An interactive 3D car you can pull apart, rebuild, and watch working. 34 parts,
each with an explanation, reference facts, and what you can check yourself with
the bonnet up. Five of them have narrated simulations of the mechanism.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 64 tests
npm run build      # typecheck, then bundle to dist/
```

## How it is put together

```
src/
  main.ts            entry point
  app.ts             state, modes, inspect, the render loop
  scene/             renderer, studio environment, lighting, orbit controls
  lib/               geometry helpers, materials, and the pure maths
  parts/             34 parts, grouped by system, plus the assembly order
  demos/             the narrated mechanism simulations
  ui/                labels, panel, chips, toast
tests/               the maths and the geometry
```

### Adding a part

One object in the matching `src/parts/*.ts` file, then add it to the order in
`registry.ts`:

```ts
export const alternator = definePart({
  id: 'alternator',
  name: 'Alternator',
  system: 'Electrics',
  explode: { dir: [0, 1, 0.4], dist: 1.7 },
  role: 'makes the electricity',
  info: 'On the front of the engine, driven by the belt…',
  detail: { madeOf: '…', attachesTo: '…', worthKnowing: '…' },
  check: 'If the battery light stays on while driving…',
  build(g) { /* geometry in car coordinates */ }
});
```

Everything a part carries lives in that one object, so a part cannot be added
with its explanation missing — the compiler will not allow it.

### Adding a simulation

A `DemoSpec` in `src/demos/`, registered in `demos/index.ts` under the part's id.
Each demo builds a stripped-down rig and returns an update function called with
the frame delta, the current narration step and how long it has been showing, so
the animation stays in step with the voice.

## Conventions worth knowing

**Rotation.** To spin something that is also tilted, put the tilt on a parent with
`mount()` and rotate the child about its own Y. Setting `rotation.y` on an object
that already has `rotation.z` does not spin it — three.js composes the Euler
angles and the axis itself swings around. The same trap applies to setting two
rotations on one object: it is what made the windscreen face sideways for weeks.

**`add()` returns the parent.** `g.add(mesh(…)).rotation.x = …` rotates the whole
group. A test asserts every part group is left unrotated.

**three.js is pinned to r128.** Later versions renamed `outputEncoding` and
changed lighting units, which would silently shift every material. Upgrading is
worth doing, but as its own change with the visuals checked afterwards.

**Tests cover the maths, not the pixels.** Every real bug so far was arithmetic
that could not be seen: camera framing that ignored aspect ratio, the Euler axis
swing, connecting rod length. Those are pure functions in `src/lib` and run in
milliseconds.

## Deploying

Static output. `npm run build` produces `dist/`, which any static host serves.
On Vercel, connecting the repository is enough — the framework is detected and
every push deploys.
