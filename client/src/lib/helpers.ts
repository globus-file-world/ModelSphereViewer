import * as THREE from "three";

/**
 * Generates points distributed on a sphere using the Fibonacci sphere algorithm
 * This creates an evenly distributed set of points on a sphere
 * 
 * @param count Number of points to generate
 * @param radius Radius of the sphere
 * @returns Array of Vector3 positions
 */
export function fibonacciSphere(count: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians
  
  for (let i = 0; i < count; i++) {
    // Calculate y position (height)
    const y = 1 - (i / (count - 1)) * 2; // Range from 1 to -1
    
    // Calculate radius at this y position (for a perfect sphere)
    const radiusAtY = Math.sqrt(1 - y * y);
    
    // Calculate theta angle
    const theta = phi * i;
    
    // Convert to Cartesian coordinates
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    
    // Add slight randomness to break perfect symmetry
    const jitter = 0.1;
    const jitterX = (Math.random() - 0.5) * jitter;
    const jitterY = (Math.random() - 0.5) * jitter;
    const jitterZ = (Math.random() - 0.5) * jitter;
    
    // Scale by sphere radius and add jitter
    points.push(new THREE.Vector3(
      x * radius + jitterX,
      y * radius + jitterY,
      z * radius + jitterZ
    ));
  }
  
  return points;
}

/**
 * Lerps (linear interpolates) between two values
 * 
 * @param start Starting value
 * @param end Ending value
 * @param t Interpolation factor (0-1)
 * @returns Interpolated value
 */
export function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t;
}

/**
 * Generates a random color
 * 
 * @returns Hex color string
 */
export function randomColor(): string {
  return `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
}

/**
 * Maps a value from one range to another
 * 
 * @param value The value to map
 * @param inMin Input range minimum
 * @param inMax Input range maximum
 * @param outMin Output range minimum
 * @param outMax Output range maximum
 * @returns Mapped value
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
