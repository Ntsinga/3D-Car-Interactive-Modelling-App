/**
 * Slider-crank geometry for the engine demo.
 *
 * Solving for the piston from the crank angle keeps the connecting rod exactly
 * its own length at every angle, which an eyeballed approximation does not.
 */

export interface CrankPose {
  /** Height of the piston pin above the crank centre. */
  pistonY: number;
  /** Crank pin position relative to the crank centre. */
  pinY: number;
  pinZ: number;
  /** Angle to lay the rod along, for rotation about the X axis. */
  rodAngle: number;
}

export function crankPose(theta: number, crankRadius: number, rodLength: number): CrankPose {
  const pinY = crankRadius * Math.cos(theta);
  const pinZ = crankRadius * Math.sin(theta);
  const pistonY = pinY + Math.sqrt(rodLength * rodLength - pinZ * pinZ);
  return { pistonY, pinY, pinZ, rodAngle: Math.atan2(pinZ, pinY - pistonY) };
}

/** Distance the piston travels between top and bottom dead centre. */
export function stroke(crankRadius: number): number {
  return crankRadius * 2;
}
