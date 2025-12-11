/**
 * Calculates the shortest difference between two angles in degrees.
 * Result is in range [-180, 180].
 */
export const getAngleDifference = (target: number, current: number): number => {
  let diff = (current - target + 180) % 360 - 180;
  return diff < -180 ? diff + 360 : diff;
};

/**
 * Normalizes an angle to 0-360 range.
 */
export const normalizeAngle = (angle: number): number => {
  return (angle + 3600) % 360;
};
