import type { PartSpec } from '../parts/types';

/** The scrolling strip of part chips, which doubles as the build checklist. */
export class Chips {
  private els = new Map<string, HTMLButtonElement>();

  constructor(container: HTMLElement, parts: PartSpec[], onPick: (p: PartSpec) => void) {
    parts.forEach((p, i) => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.innerHTML = `<span class="n">${i + 1}</span>${p.name}`;
      b.onclick = () => onPick(p);
      container.appendChild(b);
      this.els.set(p.id, b);
    });
  }

  update(p: PartSpec, state: { installed: boolean; next: boolean; selected: boolean }) {
    const b = this.els.get(p.id)!;
    b.classList.toggle('in', state.installed);
    b.classList.toggle('next', state.next);
    b.classList.toggle('sel', state.selected);
  }

  /** Shakes the chip when a part is picked out of assembly order. */
  reject(p: PartSpec) {
    const b = this.els.get(p.id)!;
    b.classList.remove('nope');
    void b.offsetWidth;
    b.classList.add('nope');
  }

  scrollTo(p: PartSpec) {
    this.els.get(p.id)!.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}
