/**
 * Camera framing maths, kept free of three.js so it can be tested directly.
 *
 * The bug this exists to prevent: the first version sized the camera from the
 * part's longest dimension and ignored the viewport shape, so a 3.3 m exhaust
 * was framed from 5.1 m and ran off both edges of a phone screen.
 */

export const MIN_DISTANCE = 1.1;
export const MAX_DISTANCE = 13;

/** Horizontal field of view implied by a vertical fov and an aspect ratio. */
export function horizontalFov(verticalFovRad: number, aspect: number): number {
  return 2 * Math.atan(Math.tan(verticalFovRad / 2) * aspect);
}

/**
 * Distance at which a sphere of `radius` fits inside the frame.
 * Uses whichever axis is tighter, which on a portrait phone is the horizontal one.
 */
export function distanceToFit(
  radius: number,
  verticalFovDeg: number,
  aspect: number,
  padding = 1.25
): number {
  const v = (verticalFovDeg * Math.PI) / 180;
  const h = horizontalFov(v, aspect);
  const need = radius / Math.sin(Math.min(v, h) / 2);
  return Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, need * padding));
}
