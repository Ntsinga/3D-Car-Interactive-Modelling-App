import type { PartSpec } from '../parts/types';

/** The information panel below the stage. */
export class Panel {
  private tag = document.getElementById('iTag')!;
  private name = document.getElementById('iName')!;
  private text = document.getElementById('iText')!;
  private facts = document.getElementById('facts')!;
  private how = document.getElementById('howBtn') as HTMLButtonElement;

  constructor(onHowItWorks: () => void) {
    this.how.onclick = onHowItWorks;
  }

  clear() {
    this.tag.textContent = 'Nothing selected';
    this.name.textContent = 'Tap any part of the car';
    this.text.textContent =
      'Every piece is separate. Pull the car apart with the slider, or switch to Build to assemble it in order.';
    this.facts.innerHTML = '';
    this.how.style.display = 'none';
  }

  show(p: PartSpec, hasDemo: boolean) {
    this.tag.textContent = `${p.system} · ${p.role}`;
    this.name.textContent = p.name;
    this.text.textContent = p.info;
    const d = p.detail;
    this.facts.innerHTML =
      `<div><b>Made of</b>${d.madeOf}</div>` +
      `<div><b>Attaches to</b>${d.attachesTo}</div>` +
      `<div><b>Worth knowing</b>${d.worthKnowing}</div>` +
      (p.check ? `<div class="chk"><b>Check it yourself</b>${p.check}</div>` : '');
    this.how.style.display = hasDemo ? 'block' : 'none';
  }
}
