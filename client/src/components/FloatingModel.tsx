import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
import { useAudio } from "../lib/stores/useAudio";
import gsap from "gsap";

interface FloatingModelProps {
  position: THREE.Vector3;
  rotation: {
    axis: THREE.Vector3;
    speed: number;
    phase: number;
  };
  hover: {
    amplitude: number;
    frequency: number;
    phaseOffset: number;
  };
  texture: THREE.Texture;
  isActive: boolean;
  index: number;
}

const MODEL_TYPES = ["plane", "cube", "sphere"];
const MODEL_SCALES = [
  [1.5, 1, 0.05], // Plane (flat rectangle)
  [0.8, 0.8, 0.8], // Cube
  [0.7, 0.7, 0.7]  // Sphere
];

const FloatingModel = ({ position, rotation, hover, texture, isActive, index }: FloatingModelProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialPos = useRef(position.clone());
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const { playHit } = useAudio();
  
  // Determine which model type to use based on index
  const modelType = MODEL_TYPES[index % MODEL_TYPES.length];
  const modelScale = MODEL_SCALES[index % MODEL_TYPES.length];
  
  // Try to load heart model for special cases
  const { scene: heartModel } = useGLTF("/geometries/heart.gltf", true);
  const useHeartModel = index % 7 === 0; // Every 7th model is a heart
  
  // Animation delay based on index for staggered intro
  const animationDelay = index * 0.1;
  
  // Set up textures
  useEffect(() => {
    if (texture && meshRef.current) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
      
      if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
        meshRef.current.material.map = texture;
        meshRef.current.material.needsUpdate = true;
      }
    }
  }, [texture]);
  
  // Initial animation
  useEffect(() => {
    if (!meshRef.current || !isActive) return;
    
    // Initial position (off-screen)
    meshRef.current.position.set(
      position.x * 3,
      position.y * 3,
      position.z * 3
    );
    meshRef.current.scale.set(0.001, 0.001, 0.001);
    
    // Animate to position
    gsap.to(meshRef.current.position, {
      x: position.x,
      y: position.y,
      z: position.z,
      duration: 2,
      delay: animationDelay,
      ease: "elastic.out(1, 0.8)"
    });
    
    // Animate scale
    gsap.to(meshRef.current.scale, {
      x: modelScale[0],
      y: modelScale[1],
      z: modelScale[2],
      duration: 1.5,
      delay: animationDelay,
      ease: "back.out(2)"
    });
    
  }, [isActive, position, modelScale, animationDelay]);

  // Handle pointer events
  const handlePointerOver = () => {
    setIsHovered(true);
    document.body.style.cursor = "pointer";
  };
  
  const handlePointerOut = () => {
    setIsHovered(false);
    document.body.style.cursor = "auto";
  };
  
  const handleClick = () => {
    playHit();
    setIsClicked(!isClicked);
    
    // Scale animation on click
    if (meshRef.current) {
      gsap.to(meshRef.current.scale, {
        x: isClicked ? modelScale[0] : modelScale[0] * 1.5,
        y: isClicked ? modelScale[1] : modelScale[1] * 1.5,
        z: isClicked ? modelScale[2] : modelScale[2] * 1.5,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)"
      });
    }
  };

  // Animation frame
  useFrame(({ clock }) => {
    if (!meshRef.current || !isActive) return;
    
    const time = clock.getElapsedTime();
    
    // Hover animation (floating effect)
    const hoverOffset = Math.sin(time * hover.frequency + hover.phaseOffset) * hover.amplitude;
    
    // Apply the hover offset to the y position
    meshRef.current.position.y = initialPos.current.y + hoverOffset;
    
    // Rotation around custom axis
    const rotationAngle = time * rotation.speed + rotation.phase;
    //meshRef.current.setRotationFromAxisAngle(rotation.axis, rotationAngle);
    
    // Add slight pulse if hovered
    if (isHovered && !isClicked) {
      const pulseScale = 1 + Math.sin(time * 5) * 0.03;
      meshRef.current.scale.set(
        modelScale[0] * pulseScale,
        modelScale[1] * pulseScale,
        modelScale[2] * pulseScale
      );
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {useHeartModel ? (
        // Use the heart model
        <primitive 
          ref={meshRef}
          object={heartModel.clone()} 
          position={position}
          scale={[0.001, 0.001, 0.001]} // Start small, will be animated
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        />
      ) : (
        // Use regular geometry
        <mesh
          ref={meshRef}
          position={position}
          scale={[0.001, 0.001, 0.001]} // Start small, will be animated
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          {modelType === "plane" && <planeGeometry args={[1, 1]} />}
          {modelType === "cube" && <boxGeometry args={[1, 1, 1]} />}
          {modelType === "sphere" && <sphereGeometry args={[1, 32, 32]} />}
          
          <meshStandardMaterial
            color={isHovered ? "#ffffff" : "#dddddd"}
            roughness={0.5}
            metalness={0.2}
            envMapIntensity={0.8}
          />
        </mesh>
      )}
      
      {isClicked && (
        <Html
          position={[position.x, position.y + 1.2, position.z]}
          center
          distanceFactor={10}
        >
          <div className="bg-black bg-opacity-70 text-white rounded-lg p-2 text-center text-sm whitespace-nowrap">
            Item #{index + 1}
          </div>
        </Html>
      )}
    </group>
  );
};

export default FloatingModel;
