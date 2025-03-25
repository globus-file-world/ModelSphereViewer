import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import FloatingModel from "./FloatingModel";
import { fibonacciSphere } from "../lib/helpers";

interface SphericalCloudProps {
  count: number;
  radius: number;
  isActive: boolean;
}

const SphericalCloud = ({ count, radius, isActive }: SphericalCloudProps) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Load textures
  const textures = {
    wood: useTexture("/textures/wood.jpg"),
    grass: useTexture("/textures/grass.png"),
    asphalt: useTexture("/textures/asphalt.png"),
    sand: useTexture("/textures/sand.jpg"),
    sky: useTexture("/textures/sky.png"),
  };
  
  // Array of available textures
  const textureArray = useMemo(() => [
    textures.wood,
    textures.grass,
    textures.asphalt,
    textures.sand,
    textures.sky,
  ], [textures]);

  // Create positions for models using Fibonacci sphere distribution
  const positions = useMemo(() => fibonacciSphere(count, radius), [count, radius]);
  
  // Create random rotation axes and speeds for each model
  const rotations = useMemo(() => 
    Array.from({ length: count }, () => ({
      axis: new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize(),
      speed: (Math.random() + 0.5) * 0.3,
      phase: Math.random() * Math.PI * 2, // Random starting phase
    })),
  [count]);
  
  // Create random hover parameters for each model
  const hoverParams = useMemo(() => 
    Array.from({ length: count }, () => ({
      amplitude: Math.random() * 0.3 + 0.2,
      frequency: Math.random() * 0.4 + 0.2,
      phaseOffset: Math.random() * Math.PI * 2,
    })),
  [count]);

  // Animation loop
  useFrame(({ clock }) => {
    if (!groupRef.current || !isActive) return;
    
    const elapsedTime = clock.getElapsedTime();
    
    // Slowly rotate the entire group
    groupRef.current.rotation.y = elapsedTime * 0.05;
  });

  return (
    <group ref={groupRef}>
      {positions.map((position, index) => (
        <FloatingModel
          key={index}
          position={position}
          rotation={rotations[index]}
          hover={hoverParams[index]}
          texture={textureArray[index % textureArray.length]}
          isActive={isActive}
          index={index}
        />
      ))}
    </group>
  );
};

export default SphericalCloud;
