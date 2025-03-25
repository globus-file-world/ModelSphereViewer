import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import SphericalCloud from "./SphericalCloud";
import Controls from "./Controls";

interface SceneProps {
  isActive: boolean;
}

const Scene = ({ isActive }: SceneProps) => {
  const { camera } = useThree();
  const sceneRef = useRef<THREE.Group>(null);
  const initialCameraPos = useRef(new THREE.Vector3(0, 0, 15));
  const targetCameraPos = useRef(new THREE.Vector3(0, 0, 12));
  
  // Animation parameters
  const animationProgress = useRef(0);
  const animationSpeed = 0.02;

  useEffect(() => {
    if (isActive) {
      // Reset animation when scene becomes active
      animationProgress.current = 0;
    }
  }, [isActive]);

  useFrame(() => {
    if (!sceneRef.current) return;
    
    // Rotate the entire scene slowly
    sceneRef.current.rotation.y += 0.001;
    
    // Camera intro animation when user starts exploring
    if (isActive && animationProgress.current < 1) {
      animationProgress.current += animationSpeed;
      
      // Smoothly interpolate camera position
      camera.position.lerpVectors(
        initialCameraPos.current,
        targetCameraPos.current,
        animationProgress.current
      );
      
      // Look at the center
      camera.lookAt(0, 0, 0);
    }
  });

  return (
    <group ref={sceneRef}>
      {/* Ambient light for overall scene brightness */}
      <ambientLight intensity={0.4} />
      
      {/* Main directional light */}
      <directional
        light
        castShadow
        position={[10, 15, 10]}
        intensity={1.5}
        shadow-mapSize={1024}
      />
      
      {/* Secondary fill light */}
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#5063ff" />
      
      {/* Spherical cloud of floating models */}
      <SphericalCloud count={24} radius={8} isActive={isActive} />
      
      {/* Camera controls to allow exploration */}
      {isActive && <Controls />}
    </group>
  );
};

export default Scene;
