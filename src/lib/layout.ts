/**
 * Label gutter layout. Pure so the packing rules can be tested at any screen size.
 *
 * Labels live in the left and right margins with leader lines pointing at the
 * part, so they never cover the car. Each column sizes its own spacing to fit
 * however many labels landed on that side.
 */

export interface Slot {
  /** Where the part actually projected to, in pixels. */
  y: number;
  /** Where its label ends up after packing. */
  labelY: number;
}

export const TOP_MARGIN = 46;
export const BOTTOM_MARGIN = 22;
export const MIN_GAP = 14;
export const MAX_GAP = 22;
/** Below this spacing the labels switch to a smaller type size. */
export const TINY_BELOW_GAP = 19;

export function gapFor(count: number, stageHeight: number): number {
  if (count <= 1) return 20;
  const span = stageHeight - BOTTOM_MARGIN - TOP_MARGIN;
  return Math.max(MIN_GAP, Math.min(MAX_GAP, span / (count - 1)));
}

/**
 * Packs labels down a column without overlaps, keeping each as close to its
 * part as the ones above it allow, then lifts the whole run if it overflows.
 */
export function packColumn(ys: number[], stageHeight: number): Slot[] {
  const gap = gapFor(ys.length, stageHeight);
  const bottom = stageHeight - BOTTOM_MARGIN;
  const sorted = [...ys].sort((a, b) => a - b);

  const out: Slot[] = [];
  let cursor = TOP_MARGIN;
  for (const y of sorted) {
    const labelY = Math.max(cursor, Math.min(y, bottom));
    out.push({ y, labelY });
    cursor = labelY + gap;
  }

  const overflow = cursor - gap - bottom;
  if (overflow > 0) {
    for (const slot of out) slot.labelY = Math.max(TOP_MARGIN, slot.labelY - overflow);
  }
  return out;
}

export function isTiny(count: number, stageHeight: number): boolean {
  return gapFor(count, stageHeight) < TINY_BELOW_GAP;
}
